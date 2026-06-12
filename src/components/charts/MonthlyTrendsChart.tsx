import React, { useMemo } from "react";
import type { FC } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MoveDiagonal2 } from "lucide-react";
import type { Transaction, PaymentMethod } from "../../types";

interface Props {
  transactions: Transaction[];
  paymentMethod: PaymentMethod;
}

function getMonthLabel(date: string) {
  const [year, month] = date.split("-");
  return `${month}/${year.slice(2)}`;
}

const SERIES = [
  { key: "expense", name: "Spese", color: "#ef4444" },
  { key: "refund", name: "Rimborsi", color: "#10b981" },
  { key: "salary", name: "Stipendi", color: "#3b82f6" },
  { key: "obligation", name: "Obbligazioni", color: "#8b5cf6" },
] as const;

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce(
    (sum: number, p: any) => sum + (Number(p.value) || 0),
    0,
  );
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {label}
      </p>
      {payload.map((p: any) => (
        <p
          key={p.dataKey}
          className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          {p.name}: €{Number(p.value).toFixed(2)}
        </p>
      ))}
      <p className="mt-1.5 border-t border-slate-200 pt-1 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
        Totale: €{total.toFixed(2)}
      </p>
    </div>
  );
};

export const MonthlyTrendsChart: FC<Props> = ({
  transactions,
  paymentMethod,
}) => {
  // Raggruppa per mese (YYYY-MM), filtrando per metodo di pagamento
  const rows = useMemo(() => {
    const map = new Map<
      string,
      { expense: number; refund: number; salary: number; obligation: number }
    >();
    const filteredTransactions = transactions.filter(
      (tx) => !tx.paymentMethod || tx.paymentMethod === paymentMethod,
    );
    for (const tx of filteredTransactions) {
      const ym = tx.date.slice(0, 7);
      if (!map.has(ym))
        map.set(ym, { expense: 0, refund: 0, salary: 0, obligation: 0 });
      map.get(ym)![tx.type] += tx.amount;
    }
    return Array.from(map.keys())
      .sort()
      .map((ym) => ({ month: getMonthLabel(ym), ...map.get(ym)! }));
  }, [transactions, paymentMethod]);

  return (
    <div
      className="relative flex h-[340px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5 xl:h-[400px] xl:w-[680px] xl:min-h-[320px] xl:min-w-[420px] xl:max-w-full xl:resize"
      title="Trascina l'angolo in basso a destra per ridimensionare"
    >
      <div className="mb-2 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-base dark:bg-violet-500/10">
          📈
        </span>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            Andamento Mensile
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Visualizza spese, rimborsi e stipendi nel tempo
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {rows.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            Nessuna transazione da visualizzare
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(148, 163, 184, 0.25)"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(v: number) => `€${v}`}
                width={56}
              />
              <Tooltip
                content={<BarTooltip />}
                cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {value}
                  </span>
                )}
              />
              {SERIES.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  fill={s.color}
                  radius={[5, 5, 0, 0]}
                  maxBarSize={28}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Resize hint (desktop only) */}
      <MoveDiagonal2 className="pointer-events-none absolute bottom-1.5 right-1.5 hidden h-3.5 w-3.5 text-slate-300 dark:text-slate-600 xl:block" />
    </div>
  );
};
