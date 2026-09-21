"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  uploadDocumentAction,
  completePeriodAsClientAction,
} from "@/app/c/actions";

export function ClientUploadPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    const fd = new FormData();
    fd.set("file", file);
    setError(null);
    setFeedback(null);
    start(async () => {
      const res = await uploadDocumentAction(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setFeedback(res.message ?? "Recibido. Puedes mandar más cuando quieras.");
      }
      if (fileRef.current) fileRef.current.value = "";
      if (cameraRef.current) cameraRef.current.value = "";
    });
  }

  if (doneMsg) {
    return (
      <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-lg font-medium text-emerald-900">{doneMsg}</p>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-4">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*,.heic,.heif,.pdf"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,.heic,.heif"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <Button
        type="button"
        size="xl"
        className="w-full"
        disabled={pending}
        onClick={() => cameraRef.current?.click()}
      >
        {pending ? "Subiendo…" : "Hacer foto"}
      </Button>

      <Button
        type="button"
        size="xl"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={() => fileRef.current?.click()}
      >
        Elegir archivo
      </Button>

      {feedback && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-emerald-900 animate-in fade-in">
          {feedback}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-red-800" role="alert">
          {error}
        </p>
      )}

      <div className="pt-6">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await completePeriodAsClientAction();
              if (res.error) setError(res.error);
              else setDoneMsg(res.message ?? "Perfecto. No te molestaremos más por este periodo.");
            })
          }
        >
          He subido todo lo de este periodo
        </Button>
      </div>
    </div>
  );
}
