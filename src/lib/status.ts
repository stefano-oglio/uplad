import {
  ClientPeriodStatus,
  CompletedBy,
  type ClientPeriod,
  type Period,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cancelPendingReminders, scheduleRemindersForClientPeriod } from "@/lib/reminders";

const PRESSURE_DAYS = 21;

export function computeDisplayStatus(
  clientPeriod: Pick<ClientPeriod, "status" | "lastActivityAt">,
  period: Pick<Period, "deadlineDate">,
  docsCount: number,
  now = new Date()
): ClientPeriodStatus {
  if (clientPeriod.status === ClientPeriodStatus.COMPLETE) {
    return ClientPeriodStatus.COMPLETE;
  }
  if (docsCount > 0) {
    return ClientPeriodStatus.IN_PROGRESS;
  }
  const pressureStart = new Date(period.deadlineDate);
  pressureStart.setDate(pressureStart.getDate() - PRESSURE_DAYS);
  if (now >= pressureStart) {
    return ClientPeriodStatus.AT_RISK;
  }
  return ClientPeriodStatus.AT_RISK;
}

export async function syncClientPeriodStatus(clientPeriodId: string) {
  const cp = await prisma.clientPeriod.findUnique({
    where: { id: clientPeriodId },
    include: {
      period: true,
      _count: { select: { documents: true } },
    },
  });
  if (!cp) return null;
  if (cp.status === ClientPeriodStatus.COMPLETE) return cp;

  const next = computeDisplayStatus(cp, cp.period, cp._count.documents);
  if (next !== cp.status) {
    return prisma.clientPeriod.update({
      where: { id: clientPeriodId },
      data: { status: next },
    });
  }
  return cp;
}

export async function markPeriodComplete(
  clientPeriodId: string,
  completedBy: CompletedBy
) {
  const updated = await prisma.clientPeriod.update({
    where: { id: clientPeriodId },
    data: {
      status: ClientPeriodStatus.COMPLETE,
      completedAt: new Date(),
      completedBy,
      lastActivityAt: new Date(),
    },
  });

  await cancelPendingReminders(clientPeriodId);

  await prisma.reminderEvent.create({
    data: {
      clientPeriodId,
      type: "PERIOD_COMPLETED",
      meta: { completedBy },
    },
  });

  return updated;
}

export async function reopenPeriod(clientPeriodId: string) {
  const cp = await prisma.clientPeriod.findUnique({
    where: { id: clientPeriodId },
    include: {
      period: true,
      _count: { select: { documents: true } },
      client: true,
    },
  });
  if (!cp) throw new Error("ClientPeriod no encontrado");

  const status = computeDisplayStatus(
    { ...cp, status: ClientPeriodStatus.IN_PROGRESS },
    cp.period,
    cp._count.documents
  );

  const updated = await prisma.clientPeriod.update({
    where: { id: clientPeriodId },
    data: {
      status,
      completedAt: null,
      completedBy: null,
      lastActivityAt: new Date(),
    },
  });

  if (!cp.client.remindersPaused) {
    await scheduleRemindersForClientPeriod(clientPeriodId);
  }

  await prisma.reminderEvent.create({
    data: {
      clientPeriodId,
      type: "PERIOD_REOPENED",
      meta: { status },
    },
  });

  return updated;
}

export async function onDocumentUploaded(clientPeriodId: string) {
  const cp = await prisma.clientPeriod.findUnique({
    where: { id: clientPeriodId },
  });
  if (!cp) return;

  if (cp.status !== ClientPeriodStatus.COMPLETE) {
    await prisma.clientPeriod.update({
      where: { id: clientPeriodId },
      data: {
        status: ClientPeriodStatus.IN_PROGRESS,
        lastActivityAt: new Date(),
      },
    });
  } else {
    await prisma.clientPeriod.update({
      where: { id: clientPeriodId },
      data: { lastActivityAt: new Date() },
    });
  }
}

export const STATUS_LABEL: Record<ClientPeriodStatus, string> = {
  COMPLETE: "Completo",
  IN_PROGRESS: "En curso",
  AT_RISK: "En riesgo",
};

export const STATUS_EMOJI: Record<ClientPeriodStatus, string> = {
  COMPLETE: "🟢",
  IN_PROGRESS: "🟡",
  AT_RISK: "🔴",
};
