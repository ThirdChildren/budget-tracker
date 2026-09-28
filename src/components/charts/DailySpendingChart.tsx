import { useMemo, type FC } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatMonth, shiftMonth } from "@/lib/format";
import { useMoney } from "@/lib/money";
import type { Transaction } from "../../types";
import { chartColors, ChartTooltipBox } from "./chartTheme";

interface Props {
  transactions: Transaction[]; // già filtrate per metodo di pagamento
  selectedMonth: string;
  dark: boolean;
}

const daysIn = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m, 0).getDate();
};

// Spesa cumulata giorno per giorno
const cumulative = (txs: Transaction[], ym: string, value: (t: Transaction) => number) => {
  const perDay = new Array(daysIn(ym)).fill(0);
  for (const tx of txs) {
    if (tx.type === "expense" && tx.date.startsWith(ym)) {
      perDay[Number(tx.date.slice(8, 10)) - 1] += value(tx);
    }
  }
  let acc = 0;
  return perDay.map((v) => (acc += v));
};

export const DailySpendingChart: FC<Props> = ({ transactions, selectedMonth, dark }) => {
  const c = chartColors(dark);
  const { value, format, formatCompact } = useMoney();
  const prevMonth = shiftMonth(selectedMonth, -1);

  const rows = useMemo(() => {
    const cur = cumulative(transactions, selectedMonth, value);
    const prev = cumulative(transactions, prevMonth, value);
    // Nel mese corrente non si disegnano i giorni futuri
    const now = new Date();
    const isCurrent =
      selectedMonth === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastDay = isCurrent ? now.getDate() : cur.length;
    return Array.from({ length: Math.max(cur.length, prev.length) }, (_, i) => ({
      day: i + 1,
      current: i < lastDay ? (cur[i] ?? null) : null,
      previous: prev[i] ?? null,
    }));
  }, [transactions, selectedMonth, prevMonth, value]);

  const hasData = rows.some((r) => r.current || r.previous);

  return (
    <section className="card animate-rise p-5 sm:p-6" style={{ animationDelay: "160ms" }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold">Ritmo di spesa</h3>
          <p className="text-xs text-subtle">Spesa cumulata nel mese rispetto al mese precedente</p>
        </div>
        <div className="flex gap-3 text-xs font-semibold text-subtle">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c.expense }} />{formatMonth(selectedMonth, { short: true })}</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 border-t-2 border-dashed" style={{ borderColor: c.tick }} />{formatMonth(prevMonth, { short: true })}</span>
        </div>
      </div>

      <div className="mt-4 h-64">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-subtle">
            Nessuna spesa da confrontare
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.expense} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={c.expense} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={c.grid} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: c.tick, fontSize: 11 }} interval={4} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: c.tick, fontSize: 11 }} tickFormatter={(v: number) => formatCompact(v)} width={60} />
              <Tooltip
                cursor={{ stroke: c.tick, strokeDasharray: "3 3" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const r = payload[0].payload as (typeof rows)[number];
                  return (
                    <ChartTooltipBox>
                      <p className="mb-1 text-sm font-bold">Giorno {label}</p>
                      {r.current !== null && (
                        <p className="flex justify-between gap-6"><span className="text-subtle">Questo mese</span><span className="font-semibold tabular" style={{ color: c.expense }}>{format(r.current)}</span></p>
                      )}
                      {r.previous !== null && (
                        <p className="flex justify-between gap-6"><span className="text-subtle">Mese prec.</span><span className="font-semibold tabular">{format(r.previous)}</span></p>
                      )}
                    </ChartTooltipBox>
                  );
                }}
              />
              <Line type="monotone" dataKey="previous" stroke={c.tick} strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={false} />
              <Area type="monotone" dataKey="current" stroke={c.expense} strokeWidth={2.5} fill="url(#spendFill)" connectNulls={false} activeDot={{ r: 5, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
};
