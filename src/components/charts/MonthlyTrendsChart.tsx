import { useMemo, type FC } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatMonth, shiftMonth } from "@/lib/format";
import { useMoney } from "@/lib/money";
import { computeTotals } from "@/lib/stats";
import type { Transaction } from "../../types";
import { chartColors, ChartTooltipBox } from "./chartTheme";

interface Props {
  transactions: Transaction[]; // già filtrate per metodo di pagamento
  selectedMonth: string;
  onSelectMonth: (m: string) => void;
  dark: boolean;
}

const MONTHS = 12;

export const MonthlyTrendsChart: FC<Props> = ({
  transactions,
  selectedMonth,
  onSelectMonth,
  dark,
}) => {
  const c = chartColors(dark);
  const { value, format, formatCompact } = useMoney();

  // Ultimi 12 mesi fino al mese selezionato, anche se vuoti
  const rows = useMemo(() => {
    const byMonth = new Map<string, Transaction[]>();
    for (const tx of transactions) {
      const ym = tx.date.slice(0, 7);
      if (!byMonth.has(ym)) byMonth.set(ym, []);
      byMonth.get(ym)!.push(tx);
    }
    return Array.from({ length: MONTHS }, (_, i) => {
      const ym = shiftMonth(selectedMonth, i - MONTHS + 1);
      const t = computeTotals(byMonth.get(ym) ?? [], value);
      return { ym, label: formatMonth(ym, { short: true }), income: t.income, expense: t.expense, net: t.net };
    });
  }, [transactions, selectedMonth, value]);

  const hasData = rows.some((r) => r.income || r.expense);

  return (
    <section className="card animate-rise p-5 sm:p-6" style={{ animationDelay: "80ms" }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold">Andamento mensile</h3>
          <p className="text-xs text-subtle">Clicca su un mese per selezionarlo</p>
        </div>
        <div className="flex gap-3 text-xs font-semibold text-subtle">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c.income }} />Entrate</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c.expense }} />Uscite</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded-full" style={{ background: c.accent }} />Saldo</span>
        </div>
      </div>

      <div className="mt-4 h-72">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-subtle">
            Nessuna transazione da visualizzare
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={rows}
              margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
              barGap={3}
              onClick={(state) => {
                const i = Number(state?.activeTooltipIndex);
                if (!Number.isNaN(i) && rows[i]) onSelectMonth(rows[i].ym);
              }}
              style={{ cursor: "pointer" }}
            >
              <CartesianGrid vertical={false} stroke={c.grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: c.tick, fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: c.tick, fontSize: 11 }} tickFormatter={(v: number) => formatCompact(v)} width={60} />
              <Tooltip
                cursor={{ fill: c.grid, radius: 8 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const r = payload[0].payload as (typeof rows)[number];
                  return (
                    <ChartTooltipBox>
                      <p className="mb-1.5 text-sm font-bold">{formatMonth(r.ym)}</p>
                      <p className="flex justify-between gap-6"><span className="text-subtle">Entrate</span><span className="font-semibold tabular" style={{ color: c.income }}>{format(r.income)}</span></p>
                      <p className="flex justify-between gap-6"><span className="text-subtle">Uscite</span><span className="font-semibold tabular" style={{ color: c.expense }}>{format(r.expense)}</span></p>
                      <p className="mt-1 flex justify-between gap-6 border-t border-line pt-1"><span className="font-semibold">Saldo</span><span className="font-bold tabular">{format(r.net)}</span></p>
                    </ChartTooltipBox>
                  );
                }}
              />
              <Bar dataKey="income" radius={[6, 6, 2, 2]} maxBarSize={18}>
                {rows.map((r) => (
                  <Cell key={r.ym} fill={c.income} opacity={r.ym === selectedMonth ? 1 : 0.35} />
                ))}
              </Bar>
              <Bar dataKey="expense" radius={[6, 6, 2, 2]} maxBarSize={18}>
                {rows.map((r) => (
                  <Cell key={r.ym} fill={c.expense} opacity={r.ym === selectedMonth ? 1 : 0.35} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="net" stroke={c.accent} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: c.accent }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
};
