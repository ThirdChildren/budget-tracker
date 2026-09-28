import { useMemo, type FC } from "react";
import { CalendarDays, Crown, Flame, Receipt } from "lucide-react";
import { getCategory, tint } from "@/lib/config";
import { formatShortDate } from "@/lib/format";
import { useMoney } from "@/lib/money";
import type { Transaction } from "@/types";
import { SpendingByCategoryChart } from "./charts/SpendingByCategoryChart";
import { MonthlyTrendsChart } from "./charts/MonthlyTrendsChart";
import { DailySpendingChart } from "./charts/DailySpendingChart";

interface Props {
  monthTransactions: Transaction[];
  allTransactions: Transaction[]; // tutte le date, già filtrate per metodo di pagamento
  selectedMonth: string;
  onSelectMonth: (m: string) => void;
  dark: boolean;
}

export const AnalyticsView: FC<Props> = ({
  monthTransactions,
  allTransactions,
  selectedMonth,
  onSelectMonth,
  dark,
}) => {
  const { value, format } = useMoney();
  const insights = useMemo(() => {
    const expenses = monthTransactions.filter((t) => t.type === "expense");
    const total = expenses.reduce((s, t) => s + value(t), 0);
    const [y, m] = selectedMonth.split("-").map(Number);
    const now = new Date();
    const isCurrent = now.getFullYear() === y && now.getMonth() + 1 === m;
    const days = isCurrent ? now.getDate() : new Date(y, m, 0).getDate();

    const biggest = expenses.reduce<Transaction | null>(
      (max, t) => (!max || value(t) > value(max) ? t : max),
      null,
    );
    const byCat = new Map<string, number>();
    for (const t of expenses) byCat.set(t.category, (byCat.get(t.category) || 0) + value(t));
    const topCat = [...byCat].sort((a, b) => b[1] - a[1])[0];

    return {
      daily: total / days,
      count: expenses.length,
      avg: expenses.length ? total / expenses.length : 0,
      biggest,
      topCat,
    };
  }, [monthTransactions, selectedMonth, value]);

  const top = insights.topCat ? getCategory(insights.topCat[0]) : null;

  const kpis = [
    {
      icon: CalendarDays,
      label: "Media giornaliera",
      value: format(insights.daily),
      hint: "di spesa al giorno",
      color: "#3b82f6",
    },
    {
      icon: Receipt,
      label: "Spesa media",
      value: format(insights.avg),
      hint: `su ${insights.count} spes${insights.count === 1 ? "a" : "e"}`,
      color: "#8b5cf6",
    },
    {
      icon: Flame,
      label: "Spesa più alta",
      value: insights.biggest ? format(value(insights.biggest)) : "—",
      hint: insights.biggest
        ? `${insights.biggest.description} · ${formatShortDate(insights.biggest.date)}`
        : "nessuna spesa",
      color: "#f43f5e",
    },
    {
      icon: top?.icon ?? Crown,
      label: "Categoria top",
      value: top ? top.name : "—",
      hint: insights.topCat ? format(insights.topCat[1]) : "nessuna spesa",
      color: top?.color ?? "#f59e0b",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {kpis.map(({ icon: Icon, label, value, hint, color }, i) => (
          <div
            key={label}
            className="card animate-rise p-4 sm:p-5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{ backgroundColor: tint(color), color }}
            >
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-xs font-semibold text-subtle sm:text-sm">{label}</p>
            <p className="mt-0.5 truncate text-lg font-extrabold tracking-tight tabular sm:text-xl">{value}</p>
            <p className="mt-1 truncate text-[11px] text-subtle">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
        <SpendingByCategoryChart transactions={monthTransactions} />
        <DailySpendingChart transactions={allTransactions} selectedMonth={selectedMonth} dark={dark} />
      </div>
      <MonthlyTrendsChart
        transactions={allTransactions}
        selectedMonth={selectedMonth}
        onSelectMonth={onSelectMonth}
        dark={dark}
      />
    </div>
  );
};
