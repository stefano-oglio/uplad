/**
 * Notifier: abstracción para email ahora y WhatsApp después.
 * En v1 WhatsApp = solo generar copy para que el asesor pegue el mensaje.
 */
import { Resend } from "resend";

export type NotifyPayload = {
  to?: string | null;
  phone?: string | null;
  subject: string;
  body: string;
  magicLinkUrl?: string;
};

export interface Notifier {
  sendEmail(payload: NotifyPayload): Promise<{ ok: boolean; error?: string }>;
  buildWhatsAppCopy(payload: NotifyPayload): string;
}

class ConsoleResendNotifier implements Notifier {
  private resend: Resend | null;

  constructor() {
    this.resend = process.env.RESEND_API_KEY
      ? new Resend(process.env.RESEND_API_KEY)
      : null;
  }

  async sendEmail(payload: NotifyPayload): Promise<{ ok: boolean; error?: string }> {
    const from = process.env.EMAIL_FROM ?? "DocInbox <noreply@localhost>";
    console.log("[Notifier:email]", {
      to: payload.to,
      subject: payload.subject,
      body: payload.body,
    });

    if (!payload.to) {
      return { ok: false, error: "Sin email de destinatario" };
    }

    if (!this.resend) {
      return { ok: true };
    }

    try {
      await this.resend.emails.send({
        from,
        to: payload.to,
        subject: payload.subject,
        text: payload.body,
      });
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error enviando email";
      console.error("[Notifier:email:error]", message);
      return { ok: false, error: message };
    }
  }

  buildWhatsAppCopy(payload: NotifyPayload): string {
    const link = payload.magicLinkUrl ?? "";
    return (
      `Hola, te escribo desde la gestoría.\n\n` +
      `${payload.body}\n\n` +
      (link ? `Sube tus facturas aquí (un toque):\n${link}\n\n` : "") +
      `Gracias.`
    );
  }
}

let notifier: Notifier | null = null;

export function getNotifier(): Notifier {
  if (!notifier) notifier = new ConsoleResendNotifier();
  return notifier;
}
