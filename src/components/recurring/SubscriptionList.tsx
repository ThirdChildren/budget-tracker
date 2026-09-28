import type { FC } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategory, tint } from "@/lib/config";
import { formatEUR, formatShortDate } from "@/lib/format";
import { FREQUENCIES, relativeDay, type RuleStatus } from "@/lib/recurring";
import type { RecurringRule } from "@/types";

interface Props {
  rules: RecurringRule[];
  statuses: Map<string, RuleStatus>;
  today: string;
  onOpen: (rule: RecurringRule) => void;
}

// Colonne condivise tra intestazione e righe (da md in su)
const cols =
  "grid-cols-[auto_minmax(0,1fr)_auto] md:grid-cols-[auto_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_auto]";

export const SubscriptionList: FC<Props> = ({ rules, statuses, today, onOpen }) => (
  <div className="card overflow-hidden">
    <div
      className={cn(
        "hidden items-center gap-x-5 border-b border-line px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-subtle md:grid",
        cols,
      )}
    >
      <span className="w-11" />
      <span>Nome</span>
      <span>Prossimo addebito</span>
      <span className="text-right">All'anno</span>
      <span className="text-right">Importo</span>
      <span className="w-4" />
    </div>

    <ul className="divide-y divide-line">
      {rules.map((rule) => {
        const cat = getCategory(rule.category);
        const Icon = cat.icon;
        const freq = FREQUENCIES[rule.frequency];
        const next = statuses.get(rule.id)?.next;
        const nextLabel = rule.active && next ? formatShortDate(next.date) : null;

        return (
          <li key={rule.id}>
            <button
              onClick={() => onOpen(rule)}
              className={cn(
                "group grid w-full items-center gap-x-4 px-4 py-4 text-left transition-colors hover:bg-surface-2/60 sm:px-6 md:gap-x-5",
                cols,
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl transition-transform group-hover:scale-105",
                  !rule.active && "grayscale",
                )}
                style={{ backgroundColor: tint(cat.color), color: cat.color }}
              >
                <Icon className="h-5 w-5" />
              </span>

              <span className={cn("min-w-0", !rule.active && "opacity-60")}>
                <span className="block truncate font-bold">{rule.description}</span>
                <span className="mt-0.5 block truncate text-xs text-subtle">
                  {cat.name} · {freq.label}
                  {/* su mobile la data del prossimo addebito sta qui */}
                  <span className="md:hidden">{nextLabel ? ` · ${nextLabel}` : ""}</span>
                </span>
              </span>

              <span className="hidden md:block">
                {rule.active && next ? (
                  <>
                    <span className="block text-sm font-semibold">{nextLabel}</span>
                    <span className="block text-xs text-subtle">{relativeDay(next.date, today)}</span>
                  </>
                ) : (
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-subtle">
                    In pausa
                  </span>
                )}
              </span>

              <span className={cn("hidden text-right text-sm text-subtle tabular md:block", !rule.active && "opacity-60")}>
                {formatEUR(rule.amount * freq.perMonth * 12)}
              </span>

              <span className={cn("text-right", !rule.active && "opacity-60")}>
                <span className="block font-extrabold tabular">{formatEUR(rule.amount)}</span>
                <span className="block text-xs text-subtle">
                  {rule.active ? `/${freq.short}` : <span className="md:hidden">in pausa</span>}
                </span>
              </span>

              <ChevronRight className="hidden h-4 w-4 text-subtle transition-transform group-hover:translate-x-0.5 md:block" />
            </button>
          </li>
        );
      })}
    </ul>
  </div>
);
