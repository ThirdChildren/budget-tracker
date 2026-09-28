import type { FC } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategory, tint } from "@/lib/config";
import { formatEUR, formatShortDate } from "@/lib/format";
import { FREQUENCIES, relativeDay, type RuleStatus } from "@/lib/recurring";
import type { RecurringRule } from "@/types";

interface Props {
  rule: RecurringRule;
  status: RuleStatus;
  today: string;
  onOpen: () => void;
}

export const InstallmentCard: FC<Props> = ({ rule, status, today, onOpen }) => {
  const cat = getCategory(rule.category);
  const Icon = cat.icon;
  const n = rule.installments ?? 0;
  const total = rule.totalAmount ?? 0;
  const remaining = Math.max(0, total - status.paidAmount);
  const percent = n ? Math.round((status.paid / n) * 100) : 0;

  return (
    <button
      onClick={onOpen}
      className="card group flex w-full flex-col gap-6 p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5"
    >
      <div className="flex w-full items-start gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: tint(cat.color), color: cat.color }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-bold">{rule.description}</span>
          <span className="mt-0.5 block truncate text-xs text-subtle">
            {cat.name} · {FREQUENCIES[rule.frequency].label}
          </span>
        </span>
        {rule.provider && (
          <span className="shrink-0 rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-bold text-ink-soft">
            {rule.provider}
          </span>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-subtle">Rata</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight tabular">{formatEUR(rule.amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-subtle">Da pagare</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight tabular">{formatEUR(remaining)}</p>
          <p className="text-xs text-subtle tabular">su {formatEUR(total)}</p>
        </div>
      </div>

      <div className="w-full">
        <div className="flex gap-1.5">
          {Array.from({ length: n }, (_, i) => (
            <span
              key={i}
              className={cn("h-2.5 flex-1 rounded-full", i >= status.paid && "bg-surface-2")}
              style={i < status.paid ? { backgroundColor: cat.color } : undefined}
            />
          ))}
        </div>
        <p className="mt-2 flex justify-between text-xs font-semibold">
          <span>
            {status.paid} di {n} rate pagate
          </span>
          <span className="text-subtle tabular">{percent}%</span>
        </p>
      </div>

      <div className="flex w-full items-center justify-between gap-3 border-t border-line pt-4 text-sm">
        {rule.active && status.next ? (
          <span className="min-w-0 truncate">
            <span className="text-subtle">Prossima rata </span>
            <span className="font-bold">{formatShortDate(status.next.date)}</span>
            <span className="text-subtle"> · {relativeDay(status.next.date, today)}</span>
          </span>
        ) : (
          <span className="font-semibold text-subtle">In pausa</span>
        )}
        <ChevronRight className="h-4 w-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
};

// Riga compatta per i piani già saldati
export const CompletedInstallment: FC<Omit<Props, "today">> = ({ rule, status, onOpen }) => {
  const cat = getCategory(rule.category);
  const Icon = cat.icon;
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-surface-2/60 sm:px-6"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl grayscale"
        style={{ backgroundColor: tint(cat.color), color: cat.color }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{rule.description}</span>
        <span className="block text-xs text-subtle">
          {rule.provider ? `${rule.provider} · ` : ""}
          {rule.installments} rate
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-income tabular">
        <CheckCircle2 className="h-4 w-4" />
        {formatEUR(status.paidAmount)}
      </span>
    </button>
  );
};
