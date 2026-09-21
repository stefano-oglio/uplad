import {
  ReminderChannel,
  ReminderJobStatus,
  ReminderStep,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getNotifier } from "@/lib/notifications";
import { createMagicLink } from "@/lib/magic-link";

// Steps relative to deadline: J-21, J-14, J-7, J-3
const STEP_OFFSET_DAYS: Record<ReminderStep, number> = {
  R1: 21,
  R2: 14,
  R3: 7,
  R4: 3,
};

const STEP_LABEL: Record<ReminderStep, string> = {
  R1: "J-21",
  R2: "J-14",
  R3: "J-7",
  R4: "J-3",
};

/**
 * Quiet hours Europe/Madrid: 22:00–09:00.
 * If scheduled time falls in quiet hours, push to 09:00 same/next day.
 */
export function adjustForQuietHours(date: Date): Date {
  const madrid = new Date(
    date.toLocaleString("en-US", { timeZone: "Europe/Madrid" })
  );
  const hour = madrid.getHours();
  const result = new Date(date);

  if (hour >= 22) {
    // Push to 09:00 next day Madrid
    const next = new Date(madrid);
    next.setDate(next.getDate() + 1);
    next.setHours(9, 0, 0, 0);
    return fromMadridWallTime(next);
  }
  if (hour < 9) {
    const same = new Date(madrid);
    same.setHours(9, 0, 0, 0);
    return fromMadridWallTime(same);
  }
  return result;
}

function fromMadridWallTime(madridLocal: Date): Date {
  // Approximate: construct ISO assuming Madrid offset of the given instant
  const asUtcGuess = Date.UTC(
    madridLocal.getFullYear(),
    madridLocal.getMonth(),
    madridLocal.getDate(),
    madridLocal.getHours(),
    madridLocal.getMinutes(),
    madridLocal.getSeconds()
  );
  // Correct by measuring offset at that instant
  const probe = new Date(asUtcGuess);
  const madridStr = probe.toLocaleString("en-US", { timeZone: "Europe/Madrid" });
  const utcStr = probe.toLocaleString("en-US", { timeZone: "UTC" });
  const offsetMs = new Date(madridStr).getTime() - new Date(utcStr).getTime();
  return new Date(asUtcGuess - offsetMs);
}

export async function scheduleRemindersForClientPeriod(clientPeriodId: string) {
  const cp = await prisma.clientPeriod.findUnique({
    where: { id: clientPeriodId },
    include: { period: true, client: true },
  });
  if (!cp || cp.client.remindersPaused) return;

  const now = new Date();
  const steps = Object.values(ReminderStep);

  for (const step of steps) {
    const offset = STEP_OFFSET_DAYS[step];
    const raw = new Date(cp.period.deadlineDate);
    raw.setDate(raw.getDate() - offset);
    raw.setHours(10, 0, 0, 0); // default 10:00 local intent
    let scheduledFor = adjustForQuietHours(raw);

    if (scheduledFor <= now) {
      // Past due: schedule soon (next allowed slot) so they still fire in demos
      const soon = new Date(now.getTime() + 60_000);
      scheduledFor = adjustForQuietHours(soon);
    }

    await prisma.reminderJob.upsert({
      where: {
        clientPeriodId_step: { clientPeriodId, step },
      },
      create: {
        clientPeriodId,
        step,
        scheduledFor,
        status: ReminderJobStatus.PENDING,
        channel: ReminderChannel.EMAIL,
      },
      update: {
        scheduledFor,
        status: ReminderJobStatus.PENDING,
        sentAt: null,
        error: null,
      },
    });
  }
}

export async function cancelPendingReminders(clientPeriodId: string) {
  await prisma.reminderJob.updateMany({
    where: {
      clientPeriodId,
      status: ReminderJobStatus.PENDING,
    },
    data: { status: ReminderJobStatus.CANCELLED },
  });

  await prisma.reminderEvent.create({
    data: {
      clientPeriodId,
      type: "REMINDERS_CANCELLED",
      meta: {},
    },
  });
}

export async function processDueReminders(limit = 50) {
  const now = new Date();
  const due = await prisma.reminderJob.findMany({
    where: {
      status: ReminderJobStatus.PENDING,
      scheduledFor: { lte: now },
      clientPeriod: {
        status: { not: "COMPLETE" },
        client: { remindersPaused: false },
      },
    },
    include: {
      clientPeriod: {
        include: {
          client: true,
          period: true,
        },
      },
    },
    take: limit,
    orderBy: { scheduledFor: "asc" },
  });

  const notifier = getNotifier();
  let sent = 0;

  for (const job of due) {
    // Re-check quiet hours at send time
    const adjusted = adjustForQuietHours(now);
    if (adjusted.getTime() - now.getTime() > 60_000) {
      await prisma.reminderJob.update({
        where: { id: job.id },
        data: { scheduledFor: adjusted },
      });
      continue;
    }

    const { client, period } = job.clientPeriod;
    const link = await createMagicLink(client.id);
    const stepLabel = STEP_LABEL[job.step];
    const subject = `Recordatorio ${stepLabel}: facturas ${period.label}`;
    const body =
      `Hola ${client.name},\n\n` +
      `Te recordamos que el cierre orientativo de ${period.label} es el ` +
      `${period.deadlineDate.toLocaleDateString("es-ES")}.\n` +
      `Por favor sube tus facturas cuando puedas.\n\n` +
      `Enlace: ${link.url}`;

    const result = await notifier.sendEmail({
      to: client.email,
      phone: client.phone,
      subject,
      body,
      magicLinkUrl: link.url,
    });

    if (result.ok) {
      await prisma.reminderJob.update({
        where: { id: job.id },
        data: {
          status: ReminderJobStatus.SENT,
          sentAt: new Date(),
          error: null,
        },
      });
      await prisma.reminderEvent.create({
        data: {
          clientPeriodId: job.clientPeriodId,
          type: "REMINDER_SENT",
          meta: {
            step: job.step,
            channel: job.channel,
            to: client.email,
          },
        },
      });
      sent++;
    } else {
      await prisma.reminderJob.update({
        where: { id: job.id },
        data: {
          status: ReminderJobStatus.FAILED,
          error: result.error ?? "Error desconocido",
        },
      });
      await prisma.reminderEvent.create({
        data: {
          clientPeriodId: job.clientPeriodId,
          type: "REMINDER_FAILED",
          meta: { step: job.step, error: result.error },
        },
      });
    }
  }

  return { processed: due.length, sent };
}

export { STEP_LABEL, STEP_OFFSET_DAYS };
