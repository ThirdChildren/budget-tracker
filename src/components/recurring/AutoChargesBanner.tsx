import type { FC } from "react";
import { FileDown, Sparkles, X } from "lucide-react";
import { formatEUR, formatShortDate } from "@/lib/format";
import type { Transaction } from "@/types";

interface Props {
  charges: Transaction[];
  onExport: () => void;
  onDismiss: () => void;
}

// Riepilogo degli addebiti ricorrenti registrati automaticamente in questa sessione
export const AutoChargesBanner: FC<Props> = ({ charges, onExport, onDismiss }) => {
  if (charges.length === 0) return null;
  const total = charges.reduce((s, t) => s + t.amount, 0);
  const shown = charges.slice(-4).reverse();

  return (
    <section className="animate-rise relative overflow-hidden rounded-3xl border border-brand-ink/20 bg-brand/25 p-4 dark:bg-brand/10 sm:p-5">
      <button
        onClick={onDismiss}
        className="absolute right-3 top-3 rounded-full p-1.5 text-ink-soft hover:bg-ink/5"
        aria-label="Chiudi"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-hero text-brand dark:bg-brand dark:text-hero">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">
            {charges.length === 1
              ? "1 addebito ricorrente registrato"
              : `${charges.length} addebiti ricorrenti registrati`}{" "}
            <span className="font-semibold text-ink-soft">· {formatEUR(total)}</span>
          </p>
          <ul className="mt-2 space-y-0.5 text-sm text-ink-soft">
            {shown.map((t) => (
              <li key={t.id} className="flex justify-between gap-3">
                <span className="truncate">
                  {formatShortDate(t.date)} · {t.description}
                </span>
                <span className="shrink-0 font-semibold tabular">-{formatEUR(t.amount)}</span>
              </li>
            ))}
            {charges.length > shown.length && (
              <li className="text-xs text-subtle">e altri {charges.length - shown.length}…</li>
            )}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 rounded-xl bg-hero px-3.5 py-2 text-xs font-bold text-white dark:bg-brand dark:text-hero"
            >
              <FileDown className="h-3.5 w-3.5" />
              Esporta JSON aggiornato
            </button>
            <span className="text-xs text-subtle">Esporta per salvarli nel tuo file.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
