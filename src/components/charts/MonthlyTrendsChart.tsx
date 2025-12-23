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
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(239, 68, 68, 0.9)");
          gradient.addColorStop(1, "rgba(239, 68, 68, 0.3)");
          return gradient;
        },
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 3,
        borderRadius: 10,
        hoverBackgroundColor: "rgba(239, 68, 68, 1)",
        hoverBorderWidth: 4,
      },
      {
        label: "Rimborsi",
        data: refunds,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(34, 197, 94, 0.9)");
          gradient.addColorStop(1, "rgba(34, 197, 94, 0.3)");
          return gradient;
        },
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 3,
        borderRadius: 10,
        hoverBackgroundColor: "rgba(34, 197, 94, 1)",
        hoverBorderWidth: 4,
      },
      {
        label: "Stipendi",
        data: salaries,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.9)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.3)");
          return gradient;
        },
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 3,
        borderRadius: 10,
        hoverBackgroundColor: "rgba(59, 130, 246, 1)",
        hoverBorderWidth: 4,
      },
    ],
  };

  return (
    <div
      className={`bg-gradient-to-br from-white via-purple-50/20 to-pink-50/30 dark:from-slate-800 dark:via-purple-900/10 dark:to-pink-900/10 rounded-3xl shadow-2xl border-2 border-purple-200/50 dark:border-slate-700 p-8 mx-auto flex flex-col items-center relative transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-3xl ${
        expanded ? "w-full max-w-5xl" : "w-full max-w-3xl"
      }`}
      style={{ height: expanded ? 560 : 420 }}
    >
      <button
        className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 transition-all hover:scale-110 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md shadow-lg"
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? "Riduci grafico" : "Espandi grafico"}
        title={expanded ? "Riduci grafico" : "Espandi grafico"}
        type="button"
      >
        {expanded ? (
          <Minimize2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        ) : (
          <Maximize2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        )}
      </button>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl shadow-lg">
          <div className="text-white text-2xl">📈</div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
            Andamento Mensile
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualizza spese, rimborsi e stipendi nel tempo
          </p>
        </div>
      </div>
      <div className="w-full" style={{ height: expanded ? "400px" : "280px" }}>
        <Bar
          key={expanded ? "expanded" : "collapsed"}
          data={data}
          options={{
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: expanded ? 20 : 10,
                  font: {
                    size: expanded ? 13 : 11,
                    weight: 600,
                    family: "'Inter', sans-serif",
                  },
                  usePointStyle: true,
                  pointStyle: "rectRounded",
                  boxWidth: expanded ? 12 : 10,
                  boxHeight: expanded ? 12 : 10,
                },
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.85)",
                padding: 16,
                cornerRadius: 12,
                titleFont: {
                  size: 15,
                  weight: "bold",
                },
                bodyFont: {
                  size: 14,
                },
                displayColors: true,
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderWidth: 1,
                callbacks: {
                  label: (context) => {
                    const label = context.dataset.label || "";
                    const value = context.parsed.y || 0;
                    return ` ${label}: €${value.toFixed(2)}`;
                  },
                  footer: (items) => {
                    const total = items.reduce(
                      (sum, item) => sum + (item.parsed.y || 0),
                      0
                    );
                    return `\nTotale: €${total.toFixed(2)}`;
                  },
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "index",
              intersect: false,
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: "rgba(139, 92, 246, 0.08)",
                  lineWidth: 1,
                },
                border: {
                  display: false,
                },
                ticks: {
                  callback: (value) => `€${value}`,
                  font: {
                    size: 12,
                    weight: 500,
                  },
                  color: "rgba(100, 116, 139, 0.8)",
                  padding: 8,
                },
              },
              x: {
                grid: {
                  display: false,
                },
                border: {
                  display: false,
                },
                ticks: {
                  font: {
                    size: 12,
                    weight: 600,
                  },
                  color: "rgba(100, 116, 139, 0.9)",
                  padding: 8,
                },
              },
            },
            animation: {
              duration: 1500,
              easing: "easeInOutCubic",
              delay: (context) => {
                let delay = 0;
                if (context.type === "data" && context.mode === "default") {
                  delay = context.dataIndex * 100;
                }
                return delay;
              },
            },
          }}
        />
      </div>
    </div>
  );
};
