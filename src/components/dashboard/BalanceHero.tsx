import type { FC } from "react";
import { ArrowDownRight, ArrowUpRight, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMonth } from "@/lib/format";
import { useMoney } from "@/lib/money";
import { percentChange, type Totals } from "@/lib/stats";

export type MonthPoint = { month: string; net: number; income: number; expense: number };

interface Props {
  month: string;
  totals: Totals;
  prevTotals: Totals;
  history: MonthPoint[];
  onSelectMonth: (m: string) => void;
}

export const BalanceHero: FC<Props> = ({
  month,
  totals,
  prevTotals,
  history,
  onSelectMonth,
}) => {
  const { format } = useMoney();
  const { net, income, expense } = totals;
  const flow = income + expense;
  const incomeShare = flow > 0 ? (income / flow) * 100 : 50;
  const savingRate = income > 0 ? (net / income) * 100 : null;
  const change = percentChange(net, prevTotals.net);
  const maxAbs = Math.max(1, ...history.map((h) => Math.abs(h.net)));

  return (
    <section className="animate-rise relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-hero to-hero-2 p-6 text-white shadow-xl shadow-hero/10 sm:p-8">
      <div className="hero-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-10 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative grid gap-8 md:grid-cols-[1fr_minmax(0,16rem)] md:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
              Saldo netto · {formatMonth(month)}
            </span>
            {change !== null && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-xs font-bold",
                  change >= 0 ? "bg-brand/20 text-brand" : "bg-rose-400/20 text-rose-300",
                )}
              >
                {change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {Math.abs(change).toFixed(0)}% vs mese prec.
              </span>
            )}
          </div>

          <p
            className={cn(
              "mt-4 text-4xl font-extrabold tracking-tight tabular sm:text-5xl",
              net < 0 && "text-rose-300",
            )}
          >
            {format(net)}
          </p>

          {/* Entrate vs uscite */}
          <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-white/10">
            {flow > 0 && (
              <>
                <div className="animate-grow-x h-full bg-brand" style={{ width: `${incomeShare}%` }} />
                <div className="h-full flex-1 bg-rose-400/80" />
              </>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:flex sm:gap-8">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium text-white/60">
                <span className="h-2 w-2 rounded-full bg-brand" /> Entrate
              </p>
              <p className="mt-0.5 text-lg font-bold tabular">{format(income)}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium text-white/60">
                <span className="h-2 w-2 rounded-full bg-rose-400" /> Uscite
              </p>
              <p className="mt-0.5 text-lg font-bold tabular">{format(expense)}</p>
            </div>
            {savingRate !== null && (
              <div className="col-span-2 sm:col-span-1">
                <p className="flex items-center gap-1.5 text-xs font-medium text-white/60">
                  <PiggyBank className="h-3.5 w-3.5" /> Risparmio
                </p>
                <p className={cn("mt-0.5 text-lg font-bold tabular", savingRate < 0 ? "text-rose-300" : "text-brand")}>
                  {savingRate.toFixed(0)}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mini storico: click su una barra per cambiare mese */}
        <div>
          <p className="mb-3 text-xs font-medium text-white/60">Ultimi 6 mesi</p>
          <div className="flex h-20 items-center gap-2 md:h-28">
            {history.map((h) => {
              const active = h.month === month;
              const height = Math.max(4, (Math.abs(h.net) / maxAbs) * 50);
              return (
                <button
                  key={h.month}
                  onClick={() => onSelectMonth(h.month)}
                  title={`${formatMonth(h.month)}: ${format(h.net)}`}
                  className="group flex h-full flex-1 flex-col items-center"
                >
                  <div className="relative flex w-full flex-1 flex-col">
                    {/* metà superiore: saldo positivo, metà inferiore: negativo */}
                    <div className="flex flex-1 items-end justify-center border-b border-white/15">
                      {h.net > 0 && (
                        <div
                          className={cn(
                            "w-full max-w-7 rounded-t-md transition-all",
                            active ? "bg-brand" : "bg-white/25 group-hover:bg-white/40",
                          )}
                          style={{ height: `${height * 2}%` }}
                        />
                      )}
                    </div>
                    <div className="flex flex-1 items-start justify-center">
                      {h.net < 0 && (
                        <div
                          className={cn(
                            "w-full max-w-7 rounded-b-md transition-all",
                            active ? "bg-rose-400" : "bg-rose-300/30 group-hover:bg-rose-300/50",
                          )}
                          style={{ height: `${height * 2}%` }}
                        />
                      )}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "mt-1.5 text-[10px] font-semibold uppercase",
                      active ? "text-brand" : "text-white/50 group-hover:text-white/80",
                    )}
                  >
                    {formatMonth(h.month, { short: true }).split(" ")[0].replace(".", "")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
