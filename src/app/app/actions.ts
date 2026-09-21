"use server";

import { revalidatePath } from "next/cache";
import { ClientPeriodStatus, ReminderStep } from "@prisma/client";
import { requireOrgId, getActivePeriod } from "@/lib/org";
import { prisma } from "@/lib/prisma";
import { createMagicLink } from "@/lib/magic-link";
import { markPeriodComplete, reopenPeriod, computeDisplayStatus } from "@/lib/status";
import {
  cancelPendingReminders,
  scheduleRemindersForClientPeriod,
} from "@/lib/reminders";
import { getNotifier } from "@/lib/notifications";
import { CompletedBy } from "@prisma/client";

export async function createPeriodAction(formData: FormData) {
  const ctx = await requireOrgId();
  const label = String(formData.get("label") ?? "").trim();
  const year = Number(formData.get("year"));
  const quarterRaw = formData.get("quarter");
  const quarter = quarterRaw ? Number(quarterRaw) : null;
  const startDate = new Date(String(formData.get("startDate")));
  const endDate = new Date(String(formData.get("endDate")));
  const deadlineDate = new Date(String(formData.get("deadlineDate")));
  const makeActive = formData.get("isActive") === "on";

  if (!label || Number.isNaN(year) || Number.isNaN(startDate.getTime())) {
    return { error: "Datos de periodo inválidos" };
  }

  if (makeActive) {
    await prisma.period.updateMany({
      where: { organizationId: ctx.organizationId, isActive: true },
      data: { isActive: false },
    });
  }

  const period = await prisma.period.create({
    data: {
      organizationId: ctx.organizationId,
      label,
      year,
      quarter,
      startDate,
      endDate,
      deadlineDate,
      isActive: makeActive,
    },
  });

  if (makeActive) {
    const clients = await prisma.client.findMany({
      where: { organizationId: ctx.organizationId },
    });
    for (const client of clients) {
      const cp = await prisma.clientPeriod.create({
        data: {
          clientId: client.id,
          periodId: period.id,
          status: ClientPeriodStatus.AT_RISK,
        },
      });
      if (!client.remindersPaused) {
        await scheduleRemindersForClientPeriod(cp.id);
      }
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/periods");
  return { ok: true };
}

export async function setActivePeriodAction(periodId: string) {
  const ctx = await requireOrgId();
  const period = await prisma.period.findFirst({
    where: { id: periodId, organizationId: ctx.organizationId },
  });
  if (!period) return { error: "Periodo no encontrado" };

  await prisma.period.updateMany({
    where: { organizationId: ctx.organizationId, isActive: true },
    data: { isActive: false },
  });
  await prisma.period.update({
    where: { id: periodId },
    data: { isActive: true },
  });

  // Ensure ClientPeriod rows exist
  const clients = await prisma.client.findMany({
    where: { organizationId: ctx.organizationId },
  });
  for (const client of clients) {
    const existing = await prisma.clientPeriod.findUnique({
      where: {
        clientId_periodId: { clientId: client.id, periodId },
      },
    });
    if (!existing) {
      const cp = await prisma.clientPeriod.create({
        data: {
          clientId: client.id,
          periodId,
          status: ClientPeriodStatus.AT_RISK,
        },
      });
      if (!client.remindersPaused) {
        await scheduleRemindersForClientPeriod(cp.id);
      }
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/periods");
  return { ok: true };
}

export async function copyClientLinkAction(clientId: string) {
  const ctx = await requireOrgId();
  const client = await prisma.client.findFirst({
    where: { id: clientId, organizationId: ctx.organizationId },
  });
  if (!client) return { error: "Cliente no encontrado" };

  const link = await createMagicLink(clientId);
  await prisma.reminderEvent.create({
    data: {
      clientPeriodId:
        (
          await prisma.clientPeriod.findFirst({
            where: {
              clientId,
              period: { isActive: true, organizationId: ctx.organizationId },
            },
          })
        )?.id ??
        (
          await ensureClientPeriod(clientId, ctx.organizationId)
        ).id,
      type: "MAGIC_LINK_CREATED",
      meta: { expiresAt: link.expiresAt.toISOString() },
    },
  });

  return { url: link.url };
}

async function ensureClientPeriod(clientId: string, organizationId: string) {
  const period = await getActivePeriod(organizationId);
  if (!period) throw new Error("No hay periodo activo");
  return prisma.clientPeriod.upsert({
    where: {
      clientId_periodId: { clientId, periodId: period.id },
    },
    create: {
      clientId,
      periodId: period.id,
      status: ClientPeriodStatus.AT_RISK,
    },
    update: {},
  });
}

export async function markCompleteAction(clientPeriodId: string) {
  const ctx = await requireOrgId();
  const cp = await prisma.clientPeriod.findFirst({
    where: {
      id: clientPeriodId,
      client: { organizationId: ctx.organizationId },
    },
  });
  if (!cp) return { error: "No encontrado" };
  await markPeriodComplete(clientPeriodId, CompletedBy.ADVISOR);
  revalidatePath("/app");
  revalidatePath(`/app/clients/${cp.clientId}`);
  return { ok: true };
}

export async function reopenAction(clientPeriodId: string) {
  const ctx = await requireOrgId();
  const cp = await prisma.clientPeriod.findFirst({
    where: {
      id: clientPeriodId,
      client: { organizationId: ctx.organizationId },
    },
  });
  if (!cp) return { error: "No encontrado" };
  await reopenPeriod(clientPeriodId);
  revalidatePath("/app");
  revalidatePath(`/app/clients/${cp.clientId}`);
  return { ok: true };
}

export async function toggleRemindersPausedAction(clientId: string) {
  const ctx = await requireOrgId();
  const client = await prisma.client.findFirst({
    where: { id: clientId, organizationId: ctx.organizationId },
  });
  if (!client) return { error: "Cliente no encontrado" };

  const next = !client.remindersPaused;
  await prisma.client.update({
    where: { id: clientId },
    data: { remindersPaused: next },
  });

  const active = await getActivePeriod(ctx.organizationId);
  if (active) {
    const cp = await prisma.clientPeriod.findUnique({
      where: {
        clientId_periodId: { clientId, periodId: active.id },
      },
    });
    if (cp) {
      if (next) {
        await cancelPendingReminders(cp.id);
      } else if (cp.status !== "COMPLETE") {
        await scheduleRemindersForClientPeriod(cp.id);
      }
      await prisma.reminderEvent.create({
        data: {
          clientPeriodId: cp.id,
          type: next ? "REMINDERS_PAUSED" : "REMINDERS_RESUMED",
          meta: {},
        },
      });
    }
  }

  revalidatePath(`/app/clients/${clientId}`);
  return { ok: true, remindersPaused: next };
}

export async function getWhatsAppCopyAction(clientId: string) {
  const ctx = await requireOrgId();
  const client = await prisma.client.findFirst({
    where: { id: clientId, organizationId: ctx.organizationId },
  });
  if (!client) return { error: "Cliente no encontrado" };

  const period = await getActivePeriod(ctx.organizationId);
  const link = await createMagicLink(clientId);
  const notifier = getNotifier();
  const copy = notifier.buildWhatsAppCopy({
    to: client.email,
    phone: client.phone,
    subject: `Facturas ${period?.label ?? ""}`,
    body: `Necesitamos tus facturas de ${period?.label ?? "este periodo"}. El cierre orientativo es el ${period ? period.deadlineDate.toLocaleDateString("es-ES") : "—"}.`,
    magicLinkUrl: link.url,
  });

  return { copy, url: link.url, phone: client.phone };
}

export async function runRemindersNowAction() {
  const ctx = await requireOrgId();
  // Only process jobs belonging to this org
  const { processDueReminders } = await import("@/lib/reminders");
  const result = await processDueReminders(20);
  revalidatePath("/app");
  void ctx;
  return result;
}

export async function refreshStatusesAction() {
  const ctx = await requireOrgId();
  const period = await getActivePeriod(ctx.organizationId);
  if (!period) return { error: "Sin periodo activo" };

  const cps = await prisma.clientPeriod.findMany({
    where: { periodId: period.id, status: { not: "COMPLETE" } },
    include: { _count: { select: { documents: true } } },
  });

  for (const cp of cps) {
    const next = computeDisplayStatus(cp, period, cp._count.documents);
    if (next !== cp.status) {
      await prisma.clientPeriod.update({
        where: { id: cp.id },
        data: { status: next },
      });
    }
  }

  revalidatePath("/app");
  return { ok: true };
}

export type { ReminderStep };
