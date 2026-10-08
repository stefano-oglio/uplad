"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ClientPeriodStatus } from "@prisma/client";
import { requireOrgId, getActivePeriod } from "@/lib/org";
import { prisma } from "@/lib/prisma";
import { scheduleRemindersForClientPeriod } from "@/lib/reminders";

function readClientFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const nif = String(formData.get("nif") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const remindersPaused = formData.get("remindersPaused") === "on";
  return { name, nif, phone, email, notes, remindersPaused };
}

export async function createClientAction(formData: FormData) {
  const ctx = await requireOrgId();
  const data = readClientFields(formData);

  if (!data.name) {
    return { error: "El nombre es obligatorio" };
  }

  const client = await prisma.client.create({
    data: {
      organizationId: ctx.organizationId,
      ...data,
    },
  });

  const period = await getActivePeriod(ctx.organizationId);
  if (period) {
    const cp = await prisma.clientPeriod.create({
      data: {
        clientId: client.id,
        periodId: period.id,
        status: ClientPeriodStatus.AT_RISK,
      },
    });
    if (!data.remindersPaused) {
      await scheduleRemindersForClientPeriod(cp.id);
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/clients");
  redirect(`/app/clients/${client.id}/edit?created=1`);
}

export async function updateClientAction(clientId: string, formData: FormData) {
  const ctx = await requireOrgId();
  const existing = await prisma.client.findFirst({
    where: { id: clientId, organizationId: ctx.organizationId },
  });
  if (!existing) return { error: "Cliente no encontrado" };

  const data = readClientFields(formData);
  if (!data.name) return { error: "El nombre es obligatorio" };

  await prisma.client.update({
    where: { id: clientId },
    data,
  });

  revalidatePath("/app");
  revalidatePath("/app/clients");
  revalidatePath(`/app/clients/${clientId}`);
  revalidatePath(`/app/clients/${clientId}/edit`);
  return { ok: true };
}

export async function deleteClientAction(clientId: string) {
  const ctx = await requireOrgId();
  const existing = await prisma.client.findFirst({
    where: { id: clientId, organizationId: ctx.organizationId },
  });
  if (!existing) return { error: "Cliente no encontrado" };

  await prisma.client.delete({ where: { id: clientId } });

  revalidatePath("/app");
  revalidatePath("/app/clients");
  redirect("/app/clients");
}
