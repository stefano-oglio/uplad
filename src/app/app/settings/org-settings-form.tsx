"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrgSettingsAction } from "./actions";

export function OrgSettingsForm({ initialName }: { initialName: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      action={(fd) => {
        setMessage(null);
        setError(null);
        start(async () => {
          const res = await updateOrgSettingsAction(fd);
          if (res?.error) setError(res.error);
          else setMessage("Nombre del despacho actualizado");
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del despacho</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={initialName}
          placeholder="Gestoría Demo SL"
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
