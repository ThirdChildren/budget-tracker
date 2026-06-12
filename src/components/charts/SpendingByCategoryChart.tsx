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
          "rgba(59, 130, 246, 0.8)", // blue
          "rgba(139, 92, 246, 0.8)", // violet
          "rgba(236, 72, 153, 0.8)", // pink
          "rgba(239, 68, 68, 0.8)", // red
          "rgba(34, 197, 94, 0.8)", // green
          "rgba(234, 179, 8, 0.8)", // yellow
          "rgba(168, 85, 247, 0.8)", // purple
          "rgba(14, 165, 233, 0.8)", // sky
          "rgba(251, 146, 60, 0.8)", // orange
          "rgba(100, 116, 139, 0.8)", // slate
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(139, 92, 246)",
          "rgb(236, 72, 153)",
          "rgb(239, 68, 68)",
          "rgb(34, 197, 94)",
          "rgb(234, 179, 8)",
          "rgb(168, 85, 247)",
          "rgb(14, 165, 233)",
          "rgb(251, 146, 60)",
          "rgb(100, 116, 139)",
        ],
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  return (
    <div
      className="relative flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
      style={{ minHeight: expanded ? 520 : 380 }}
    >
      <button
        className="absolute top-4 right-4 rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? "Riduci grafico" : "Espandi grafico"}
        title={expanded ? "Riduci grafico" : "Espandi grafico"}
        type="button"
      >
        {expanded ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </button>
      <div className="mb-4 flex items-center gap-2.5 pr-12">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-base dark:bg-indigo-500/10">
          📊
        </span>
        <h3 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
          Spese per Categoria
        </h3>
      </div>
      <div
        className="flex w-full flex-1 items-center justify-center"
        style={{ height: expanded ? "380px" : "260px" }}
      >
        <Pie
          key={expanded ? "expanded" : "collapsed"}
          data={data}
          options={{
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: expanded ? 15 : 8,
                  font: {
                    size: expanded ? 12 : 10,
                    weight: 500,
                  },
                  usePointStyle: true,
                  pointStyle: "circle",
                },
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                padding: 12,
                cornerRadius: 8,
                titleFont: {
                  size: 14,
                  weight: "bold",
                },
                bodyFont: {
                  size: 13,
                },
                callbacks: {
                  label: (context) => {
                    const label = context.label || "";
                    const value = context.parsed || 0;
                    return ` ${label}: €${value.toFixed(2)}`;
                  },
                },
              },
            },
            maintainAspectRatio: false,
            animation: {
              animateRotate: true,
              animateScale: true,
            },
          }}
        />
      </div>
    </div>
  );
};
