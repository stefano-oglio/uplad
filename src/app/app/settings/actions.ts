"use server";

import { revalidatePath } from "next/cache";
import { requireOrgId } from "@/lib/org";
import { prisma } from "@/lib/prisma";

export async function updateOrgSettingsAction(formData: FormData) {
  const ctx = await requireOrgId();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre del despacho es obligatorio" };

  await prisma.organization.update({
    where: { id: ctx.organizationId },
    data: { name },
  });

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { ok: true };
}
