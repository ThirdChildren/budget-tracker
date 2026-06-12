import React, { useMemo } from "react";
import type { FC } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MoveDiagonal2 } from "lucide-react";
import type { Transaction } from "../../types";

interface Props {
  transactions: Transaction[];
}

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#10b981", // emerald
  "#eab308", // yellow
  "#06b6d4", // cyan
  "#f97316", // orange
  "#3b82f6", // blue
  "#64748b", // slate
];

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: item } = payload[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {name}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        €{Number(value).toFixed(2)}
        {item.percent != null && (
          <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
            ({item.percent.toFixed(1)}%)
          </span>
        )}
      </p>
    </div>
  );
};

export const SpendingByCategoryChart: FC<Props> = ({ transactions }) => {
  // Solo le spese, aggregate per categoria
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== "expense") continue;
      map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
    }
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    return Array.from(map, ([name, value]) => ({
      name,
      value,
      percent: total > 0 ? (value / total) * 100 : 0,
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  return (
    <div
      className="relative flex h-[340px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5 xl:h-[400px] xl:w-[440px] xl:min-h-[320px] xl:min-w-[360px] xl:max-w-full xl:resize"
      title="Trascina l'angolo in basso a destra per ridimensionare"
    >
      <div className="mb-2 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-base dark:bg-indigo-500/10">
          📊
        </span>
        <h3 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
          Spese per Categoria
        </h3>
      </div>

      <div className="min-h-0 flex-1">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            Nessuna spesa nel periodo selezionato
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="50%"
                outerRadius="78%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Resize hint (desktop only) */}
      <MoveDiagonal2 className="pointer-events-none absolute bottom-1.5 right-1.5 hidden h-3.5 w-3.5 text-slate-300 dark:text-slate-600 xl:block" />
    </div>
  );
};
