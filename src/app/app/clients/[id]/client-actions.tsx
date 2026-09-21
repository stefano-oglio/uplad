"use client";

import { useState, useTransition } from "react";
import { ClientPeriodStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  copyClientLinkAction,
  markCompleteAction,
  reopenAction,
  toggleRemindersPausedAction,
  getWhatsAppCopyAction,
} from "@/app/app/actions";

export function ClientActions({
  clientId,
  clientPeriodId,
  status,
  remindersPaused,
}: {
  clientId: string;
  clientPeriodId: string;
  status: ClientPeriodStatus;
  remindersPaused: boolean;
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [waCopy, setWaCopy] = useState<string | null>(null);

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await copyClientLinkAction(clientId);
              if (res.url) {
                await navigator.clipboard.writeText(res.url);
                setMessage("Enlace del cliente copiado");
              } else {
                setMessage(res.error ?? "Error");
              }
            })
          }
        >
          Copiar enlace del cliente
        </Button>

        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await getWhatsAppCopyAction(clientId);
              if (res.copy) {
                setWaCopy(res.copy);
                await navigator.clipboard.writeText(res.copy);
                setMessage(
                  res.phone
                    ? `Mensaje WhatsApp copiado (para ${res.phone})`
                    : "Mensaje WhatsApp copiado"
                );
              } else {
                setMessage(res.error ?? "Error");
              }
            })
          }
        >
          Copiar mensaje WhatsApp
        </Button>

        {status === "COMPLETE" ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await reopenAction(clientPeriodId);
                setMessage("Periodo reabierto");
              })
            }
          >
            Reabrir
          </Button>
        ) : (
          <Button
            type="button"
            variant="success"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await markCompleteAction(clientPeriodId);
                setMessage("Periodo marcado completo");
              })
            }
          >
            Marcar periodo completo
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await toggleRemindersPausedAction(clientId);
              setMessage(
                res.remindersPaused
                  ? "Recordatorios pausados"
                  : "Recordatorios reanudados"
              );
            })
          }
        >
          {remindersPaused ? "Reanudar recordatorios" : "Pausar recordatorios"}
        </Button>
      </div>

      {message && <p className="text-sm text-teal-800">{message}</p>}

      {waCopy && (
        <pre className="max-h-48 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700 whitespace-pre-wrap">
          {waCopy}
        </pre>
      )}
    </div>
  );
}
