import React, { useMemo } from "react";
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
import type { Transaction } from "../../types";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  transactions: Transaction[];
  selectedMonth: string; // YYYY-MM
}

export const StackedBarChart: FC<Props> = ({ transactions, selectedMonth }) => {
  // Filtra per mese selezionato
  const filtered = useMemo(
    () => transactions.filter((t) => t.date.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  );
  const byTypeAndCategory = useMemo(() => {
    const map = new Map<
      string,
      { expense: number; refund: number; salary: number }
    >();
    for (const tx of filtered) {
      if (!map.has(tx.category))
        map.set(tx.category, { expense: 0, refund: 0, salary: 0 });
      map.get(tx.category)![tx.type] += tx.amount;
    }
    return map;
  }, [filtered]);

  const categories = Array.from(byTypeAndCategory.keys());
  const expenses = categories.map(
    (c) => byTypeAndCategory.get(c)?.expense ?? 0
  );
  const refunds = categories.map((c) => byTypeAndCategory.get(c)?.refund ?? 0);
  const salaries = categories.map((c) => byTypeAndCategory.get(c)?.salary ?? 0);

  const data = {
    labels: categories,
    datasets: [
      {
        label: "Spese",
        data: expenses,
        backgroundColor: "#ef4444",
        stack: "Stack 0",
      },
      {
        label: "Rimborsi",
        data: refunds,
        backgroundColor: "#10b981",
        stack: "Stack 0",
      },
      {
        label: "Stipendi",
        data: salaries,
        backgroundColor: "#3b82f6",
        stack: "Stack 0",
      },
    ],
  };

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 w-full max-w-2xl mx-auto"
      style={{ height: 320 }}
    >
      <h3 className="text-base font-semibold mb-2 text-center">
        Categorie nel mese selezionato
      </h3>
      <div className="w-full h-64">
        <Bar
          data={data}
          options={{
            plugins: { legend: { position: "bottom" } },
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { stacked: true }, y: { stacked: true } },
          }}
        />
      </div>
    </div>
  );
};
