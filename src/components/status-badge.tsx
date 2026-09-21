import { ClientPeriodStatus } from "@prisma/client";
import { STATUS_EMOJI, STATUS_LABEL } from "@/lib/status";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: ClientPeriodStatus;
  className?: string;
}) {
  const colors: Record<ClientPeriodStatus, string> = {
    COMPLETE: "bg-emerald-50 text-emerald-800 border-emerald-200",
    IN_PROGRESS: "bg-amber-50 text-amber-900 border-amber-200",
    AT_RISK: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        colors[status],
        className
      )}
    >
      <span aria-hidden>{STATUS_EMOJI[status]}</span>
      {STATUS_LABEL[status]}
    </span>
  );
}
