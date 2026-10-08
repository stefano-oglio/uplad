"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createClientAction,
  updateClientAction,
  deleteClientAction,
} from "./actions";

export type ClientFormValues = {
  name: string;
  nif: string;
  phone: string;
  email: string;
  notes: string;
  remindersPaused: boolean;
};

export function ClientForm({
  mode,
  clientId,
  initial,
}: {
  mode: "create" | "edit";
  clientId?: string;
  initial?: ClientFormValues;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const defaults: ClientFormValues = initial ?? {
    name: "",
    nif: "",
    phone: "",
    email: "",
    notes: "",
    remindersPaused: false,
  };

  return (
    <form
      className="max-w-xl space-y-5"
      action={(fd) => {
        setError(null);
        setSaved(false);
        start(async () => {
          if (mode === "create") {
            const res = await createClientAction(fd);
            if (res?.error) setError(res.error);
            return;
          }
          if (!clientId) return;
          const res = await updateClientAction(clientId, fd);
          if (res?.error) setError(res.error);
          else {
            setSaved(true);
            router.refresh();
          }
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Nombre / razón social *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={defaults.name}
          placeholder="Bar La Esquina"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nif">NIF / CIF</Label>
          <Input
            id="nif"
            name="nif"
            defaultValue={defaults.nif}
            placeholder="B12345678"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={defaults.phone}
            placeholder="+34600111222"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={defaults.email}
          placeholder="cliente@empresa.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={defaults.notes}
          placeholder="Sector, particularidades, preferencias de contacto…"
          className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="remindersPaused"
          defaultChecked={defaults.remindersPaused}
          className="rounded border-slate-300"
        />
        Pausar recordatorios para este cliente
      </label>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm text-emerald-700">Cambios guardados</p>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Guardando…"
            : mode === "create"
              ? "Crear cliente"
              : "Guardar cambios"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/app/clients")}
        >
          Volver
        </Button>
      </div>

      {mode === "edit" && clientId && (
        <div className="border-t border-slate-200 pt-6">
          {!confirmDelete ? (
            <Button
              type="button"
              variant="ghost"
              className="text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={() => setConfirmDelete(true)}
            >
              Eliminar cliente
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">
                ¿Eliminar este cliente y todos sus documentos/periodos? Esta
                acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="danger"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await deleteClientAction(clientId);
                    })
                  }
                >
                  Sí, eliminar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
