"use client";

import { useTransition } from "react";
import { setActivePeriodAction } from "../actions";
import { Button } from "@/components/ui/button";

export function SetActiveButton({ periodId }: { periodId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await setActivePeriodAction(periodId);
        })
      }
    >
      {pending ? "Activando…" : "Activar"}
    </Button>
  );
}
