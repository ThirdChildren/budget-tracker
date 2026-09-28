import { useMemo, useState, type FC } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { getCategory } from "@/lib/config";
import { useMoney } from "@/lib/money";
import type { Transaction } from "../../types";

interface Props {
  transactions: Transaction[];
}

export const SpendingByCategoryChart: FC<Props> = ({ transactions }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const { value: valueOf, format } = useMoney();

  // Solo le spese, aggregate per categoria
  const { data, total } = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== "expense") continue;
      map.set(tx.category, (map.get(tx.category) || 0) + valueOf(tx));
    }
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    const data = Array.from(map, ([name, value]) => ({
      name,
      value,
      percent: total > 0 ? (value / total) * 100 : 0,
      color: getCategory(name).color,
    })).sort((a, b) => b.value - a.value);
    return { data, total };
  }, [transactions, valueOf]);

  const focus = hovered !== null ? data[hovered] : null;

  return (
    <section className="card animate-rise p-5 sm:p-6">
      <h3 className="text-base font-bold">Spese per categoria</h3>
      <p className="text-xs text-subtle">Passa sopra una fetta o una voce per i dettagli</p>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-subtle">
          Nessuna spesa nel periodo selezionato
        </div>
      ) : (
        <div className="mt-4 grid items-center gap-6 sm:grid-cols-[minmax(0,15rem)_1fr]">
          <div className="relative mx-auto aspect-square w-full max-w-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="68%"
                  outerRadius="100%"
                  paddingAngle={2}
                  cornerRadius={6}
                  strokeWidth={0}
                  onMouseEnter={(_, i) => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {data.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      opacity={hovered === null || hovered === i ? 1 : 0.25}
                      style={{ transition: "opacity .2s", outline: "none" }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Etichetta centrale */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="max-w-[70%] truncate text-xs font-semibold text-subtle">
                {focus ? focus.name : "Totale"}
              </span>
              <span className="text-xl font-extrabold tracking-tight tabular">
                {format(focus ? focus.value : total)}
              </span>
              {focus && (
                <span className="text-xs font-bold" style={{ color: focus.color }}>
                  {focus.percent.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          <ul className="space-y-1">
            {data.map((d, i) => (
              <li
                key={d.name}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "rounded-xl px-2.5 py-2 transition-all",
                  hovered === i ? "bg-surface-2" : hovered !== null && "opacity-50",
                )}
              >
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 font-semibold">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="truncate">{d.name}</span>
                  </span>
                  <span className="shrink-0 font-bold tabular">{format(d.value)}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full" style={{ width: `${d.percent}%`, backgroundColor: d.color }} />
                  </div>
                  <span className="w-10 text-right text-[11px] text-subtle tabular">{d.percent.toFixed(0)}%</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
