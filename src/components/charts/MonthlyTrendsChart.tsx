import React, { useMemo, useState } from "react";
import type { FC } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Maximize2, Minimize2 } from "lucide-react";
import type { Transaction } from "../../types";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  transactions: Transaction[];
}

function getMonthLabel(date: string) {
  const [year, month] = date.split("-");
  return `${month}/${year.slice(2)}`;
}

export const MonthlyTrendsChart: FC<Props> = ({ transactions }) => {
  const [expanded, setExpanded] = useState(false);
  // Raggruppa per mese (YYYY-MM)
  const dataByMonth = useMemo(() => {
    const map = new Map<
      string,
      { expense: number; refund: number; salary: number }
    >();
    for (const tx of transactions) {
      const ym = tx.date.slice(0, 7);
      if (!map.has(ym)) map.set(ym, { expense: 0, refund: 0, salary: 0 });
      map.get(ym)![tx.type] += tx.amount;
    }
    return map;
  }, [transactions]);

  const labels = Array.from(dataByMonth.keys()).sort();
  const expenses = labels.map((m) => dataByMonth.get(m)?.expense ?? 0);
  const refunds = labels.map((m) => dataByMonth.get(m)?.refund ?? 0);
  const salaries = labels.map((m) => dataByMonth.get(m)?.salary ?? 0);

  const data = {
    labels: labels.map(getMonthLabel),
    datasets: [
      {
        label: "Spese",
        data: expenses,
        backgroundColor: "#ef4444",
      },
      {
        label: "Rimborsi",
        data: refunds,
        backgroundColor: "#10b981",
      },
      {
        label: "Stipendi",
        data: salaries,
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mx-auto flex flex-col items-center relative transition-all duration-300 ${
        expanded ? "w-full max-w-3xl" : "w-full max-w-2xl"
      }`}
      style={{ height: expanded ? 480 : 320 }}
    >
      <button
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? "Riduci grafico" : "Espandi grafico"}
        title={expanded ? "Riduci grafico" : "Espandi grafico"}
        type="button"
      >
        {expanded ? (
          <Minimize2 className="w-5 h-5" />
        ) : (
          <Maximize2 className="w-5 h-5" />
        )}
      </button>
      <h3 className="text-base font-semibold mb-2 text-center">
        Andamento Mensile
      </h3>
      <div className="w-full h-64 flex-1">
        <Bar
          data={data}
          options={{
            plugins: { legend: { position: "bottom" } },
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
};
