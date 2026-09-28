import type { FC } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPES, TYPE_ORDER } from "@/lib/config";
import { useMoney } from "@/lib/money";
import { percentChange, type Totals } from "@/lib/stats";
import type { TransactionType } from "@/types";

interface Props {
  totals: Totals;
  prevTotals: Totals;
  onSelect: (type: TransactionType) => void;
}

export const StatTiles: FC<Props> = ({ totals, prevTotals, onSelect }) => {
  const { format } = useMoney();
  return (
  <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
    {TYPE_ORDER.map((type, i) => {
      const cfg = TYPES[type];
      const Icon = cfg.icon;
      const change = percentChange(totals[type], prevTotals[type]);
      // Per le spese un aumento è negativo, per le entrate è positivo
      const good = change !== null && (type === "expense" ? change <= 0 : change >= 0);

      return (
        <button
          key={type}
          onClick={() => onSelect(type)}
          style={{ animationDelay: `${80 + i * 60}ms` }}
          className="card animate-rise group relative overflow-hidden p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5 sm:p-5"
        >
          <div className="flex items-center justify-between">
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", cfg.bg, cfg.text)}>
              <Icon className="h-5 w-5" />
            </span>
            <ChevronRight className="h-4 w-4 -translate-x-1 text-subtle opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
          </div>
          <p className="mt-4 text-xs font-semibold text-subtle sm:text-sm">{cfg.plural}</p>
          <p className="mt-0.5 truncate text-lg font-extrabold tracking-tight tabular sm:text-2xl">
            {format(totals[type])}
          </p>
          <p className="mt-2 flex h-4 items-center gap-1 text-[11px] font-semibold">
            {change === null ? (
              <span className="text-subtle">—</span>
            ) : (
              <>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-1.5 py-0.5",
                    good ? "bg-income/10 text-income" : "bg-expense/10 text-expense",
                  )}
                >
                  {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(change).toFixed(0)}%
                </span>
                <span className="truncate text-subtle">vs mese prec.</span>
              </>
            )}
          </p>
          {/* accento colorato in basso */}
          <span
            className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
            style={{ background: cfg.cssVar }}
          />
        </button>
      );
    })}
  </div>
  );
};
