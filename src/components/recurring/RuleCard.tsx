import { useState, type FC } from "react";
import { CheckCircle2, Pause, Pencil, Play, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategory, tint } from "@/lib/config";
import { formatEUR, formatShortDate } from "@/lib/format";
import { FREQUENCIES, relativeDay, type RuleStatus } from "@/lib/recurring";
import type { RecurringRule } from "@/types";

interface Props {
  rule: RecurringRule;
  status: RuleStatus;
  today: string;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export const RuleCard: FC<Props> = ({ rule, status, today, onEdit, onToggle, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cat = getCategory(rule.category);
  const Icon = cat.icon;
  const freq = FREQUENCIES[rule.frequency];
  const isInstallment = rule.kind === "installment";
  const total = rule.totalAmount ?? 0;
  const n = rule.installments ?? 0;
  const progress = isInstallment && n ? (status.paid / n) * 100 : 0;

  const badge = status.completed
    ? { label: "Completato", className: "bg-income/10 text-income" }
    : rule.active
      ? { label: "Attivo", className: "bg-brand/40 text-ink dark:bg-brand/15 dark:text-brand" }
      : { label: "In pausa", className: "bg-surface-2 text-subtle" };

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-xl text-subtle transition-colors hover:bg-surface-2 hover:text-ink";

  return (
    <article className={cn("card animate-rise flex flex-col p-5 transition-shadow hover:shadow-lg hover:shadow-ink/5", !rule.active && !status.completed && "opacity-75")}>
      <div className="flex items-start gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: tint(cat.color), color: cat.color }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-bold">{rule.description}</h3>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", badge.className)}>
              {badge.label}
            </span>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-subtle">
            {isInstallment && rule.provider && (
              <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-bold text-ink-soft">{rule.provider}</span>
            )}
            {cat.name} · {freq.label}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-extrabold tracking-tight tabular">
            {formatEUR(rule.amount)}
            <span className="ml-1 text-sm font-semibold text-subtle">/{isInstallment ? "rata" : freq.short}</span>
          </p>
          <p className="text-xs text-subtle tabular">
            {isInstallment
              ? `${n} rate · totale ${formatEUR(total)}`
              : `≈ ${formatEUR(rule.amount * freq.perMonth * 12)} all'anno`}
          </p>
        </div>
        {!isInstallment && status.paid > 0 && (
          <p className="text-right text-xs text-subtle">
            Speso finora
            <span className="block text-sm font-bold text-ink tabular">{formatEUR(status.paidAmount)}</span>
          </p>
        )}
      </div>

      {isInstallment && (
        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold">
            <span>
              {status.paid}/{n} rate pagate
            </span>
            <span className="text-subtle tabular">
              {status.completed ? "Saldato" : `Restano ${formatEUR(Math.max(0, total - status.paidAmount))}`}
            </span>
          </div>
          {/* una tacca per rata */}
          <div className="mt-2 flex gap-1">
            {Array.from({ length: n }, (_, i) => (
              <span
                key={i}
                className={cn("h-2 flex-1 rounded-full transition-colors", i < status.paid ? "" : "bg-surface-2")}
                style={i < status.paid ? { backgroundColor: cat.color } : undefined}
              />
            ))}
          </div>
          <span className="sr-only">{progress.toFixed(0)}% completato</span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
        <div className="min-w-0 text-xs">
          {status.completed ? (
            <span className="flex items-center gap-1.5 font-semibold text-income">
              <CheckCircle2 className="h-4 w-4" /> Tutte le rate registrate
            </span>
          ) : status.next && rule.active ? (
            <>
              <span className="text-subtle">Prossimo · </span>
              <span className="font-bold">{formatShortDate(status.next.date)}</span>
              <span className="text-subtle"> · {relativeDay(status.next.date, today)}</span>
            </>
          ) : (
            <span className="text-subtle">Nessun addebito in programma</span>
          )}
        </div>

        {confirmDelete ? (
          <div className="flex shrink-0 items-center gap-1.5 animate-in fade-in">
            <button onClick={() => setConfirmDelete(false)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-subtle hover:bg-surface-2">
              Annulla
            </button>
            <button onClick={onDelete} className="rounded-lg bg-expense px-2.5 py-1.5 text-xs font-bold text-white">
              Elimina
            </button>
          </div>
        ) : (
          <div className="flex shrink-0">
            <button onClick={onEdit} className={iconBtn} title="Modifica" aria-label="Modifica">
              <Pencil className="h-4 w-4" />
            </button>
            {!status.completed && (
              <button
                onClick={onToggle}
                className={iconBtn}
                title={rule.active ? "Metti in pausa" : "Riprendi"}
                aria-label={rule.active ? "Metti in pausa" : "Riprendi"}
              >
                {rule.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={() => setConfirmDelete(true)}
              className={cn(iconBtn, "hover:bg-expense/10 hover:text-expense")}
              title="Elimina"
              aria-label="Elimina"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
