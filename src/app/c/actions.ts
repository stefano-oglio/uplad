"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getClientSession } from "@/lib/magic-link";
import {
  ALLOWED_MIME_TYPES,
  getMaxUploadBytes,
  getStorage,
} from "@/lib/storage";
import { onDocumentUploaded, markPeriodComplete } from "@/lib/status";
import { CompletedBy } from "@prisma/client";
import { getOcrProvider } from "@/lib/ocr";

const ALLOWED = new Set<string>(ALLOWED_MIME_TYPES);

export async function uploadDocumentAction(formData: FormData) {
  const session = await getClientSession();
  if (!session) return { error: "Sesión no válida. Abre de nuevo el enlace." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No se recibió archivo" };

  if (file.size > getMaxUploadBytes()) {
    return { error: "El archivo supera el límite de 15 MB" };
  }

  const mimeType = file.type || "application/octet-stream";
  if (!ALLOWED.has(mimeType)) {
    // HEIC sometimes comes as empty type from some browsers
    const name = file.name.toLowerCase();
    const okExt =
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".png") ||
      name.endsWith(".webp") ||
      name.endsWith(".pdf") ||
      name.endsWith(".heic") ||
      name.endsWith(".heif");
    if (!okExt) {
      return {
        error:
          "Formato no permitido. Usa JPG, PNG, WEBP, HEIC o PDF.",
      };
    }
  }

  const period = await prisma.period.findFirst({
    where: {
      organizationId: session.organizationId,
      isActive: true,
    },
  });
  if (!period) return { error: "No hay periodo activo" };

  let cp = await prisma.clientPeriod.findUnique({
    where: {
      clientId_periodId: {
        clientId: session.clientId,
        periodId: period.id,
      },
    },
  });
  if (!cp) {
    cp = await prisma.clientPeriod.create({
      data: {
        clientId: session.clientId,
        periodId: period.id,
        status: "AT_RISK",
      },
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase()
    : "bin";
  const storageKey = `${session.organizationId}/${session.clientId}/${period.id}/${nanoid()}.${ext}`;

  const storage = getStorage();
  const resolvedMime =
    mimeType !== "application/octet-stream"
      ? mimeType
      : ext === "pdf"
        ? "application/pdf"
        : ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : ext === "heic" || ext === "heif"
              ? "image/heic"
              : "image/jpeg";

  await storage.putObject(storageKey, buffer, resolvedMime);

  // OCR stub — never calls paid APIs in v1
  const ocr = await getOcrProvider().extract({
    storageKey,
    mimeType: resolvedMime,
  });

  await prisma.document.create({
    data: {
      clientPeriodId: cp.id,
      storageKey,
      originalFileName: file.name || `documento.${ext}`,
      mimeType: resolvedMime,
      sizeBytes: buffer.length,
      ocrJson: ocr ?? undefined,
    },
  });

  await onDocumentUploaded(cp.id);

  await prisma.reminderEvent.create({
    data: {
      clientPeriodId: cp.id,
      type: "DOCUMENT_UPLOADED",
      meta: { fileName: file.name, sizeBytes: buffer.length },
    },
  });

  revalidatePath(`/c/buzon`);
  return { ok: true, message: "Recibido. Puedes mandar más cuando quieras." };
}

export async function completePeriodAsClientAction() {
  const session = await getClientSession();
  if (!session) return { error: "Sesión no válida" };

  const period = await prisma.period.findFirst({
    where: { organizationId: session.organizationId, isActive: true },
  });
  if (!period) return { error: "No hay periodo activo" };

  const cp = await prisma.clientPeriod.findUnique({
    where: {
      clientId_periodId: {
        clientId: session.clientId,
        periodId: period.id,
      },
    },
  });
  if (!cp) return { error: "Periodo de cliente no encontrado" };

  await markPeriodComplete(cp.id, CompletedBy.CLIENT);
  revalidatePath(`/c/buzon`);
  return {
    ok: true,
    message: "Perfecto. No te molestaremos más por este periodo.",
  };
}
