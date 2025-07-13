import React, { useMemo, useState } from "react";
import type { FC } from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Maximize2, Minimize2 } from "lucide-react";
import type { Transaction } from "../../types";

Chart.register(ArcElement, Tooltip, Legend);

interface Props {
  transactions: Transaction[];
}

export const SpendingByCategoryChart: FC<Props> = ({ transactions }) => {
  const [expanded, setExpanded] = useState(false);
  // Filtra solo le spese
  const expenses = useMemo(
    () => transactions.filter((t) => t.type === "expense"),
    [transactions]
  );
  const dataByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of expenses) {
      map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
    }
    return map;
  }, [expenses]);

  const data = {
    labels: Array.from(dataByCategory.keys()),
    datasets: [
      {
        label: "Spesa per categoria",
        data: Array.from(dataByCategory.values()),
        backgroundColor: [
          "#3b82f6",
          "#6366f1",
          "#f59e42",
          "#ef4444",
          "#10b981",
          "#eab308",
          "#a21caf",
          "#0ea5e9",
          "#f472b6",
          "#64748b",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mx-auto flex flex-col items-center relative transition-all duration-300 ${
        expanded ? "w-full max-w-3xl" : "w-full max-w-xs"
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
        Spese per Categoria
      </h3>
      <div className="w-full h-64 flex-1">
        <Pie
          data={data}
          options={{
            plugins: { legend: { position: "bottom" } },
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
};
