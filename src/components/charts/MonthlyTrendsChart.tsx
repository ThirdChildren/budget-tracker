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
import type { Transaction, PaymentMethod } from "../../types";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  transactions: Transaction[];
  paymentMethod: PaymentMethod;
}

function getMonthLabel(date: string) {
  const [year, month] = date.split("-");
  return `${month}/${year.slice(2)}`;
}

export const MonthlyTrendsChart: FC<Props> = ({
  transactions,
  paymentMethod,
}) => {
  const [expanded, setExpanded] = useState(false);
  // Raggruppa per mese (YYYY-MM)
  const dataByMonth = useMemo(() => {
    const map = new Map<
      string,
      { expense: number; refund: number; salary: number; obligation: number }
    >();
    // Filtra le transazioni in base al metodo di pagamento selezionato
    const filteredTransactions = transactions.filter(
      (tx) => !tx.paymentMethod || tx.paymentMethod === paymentMethod,
    );
    for (const tx of filteredTransactions) {
      const ym = tx.date.slice(0, 7);
      if (!map.has(ym))
        map.set(ym, { expense: 0, refund: 0, salary: 0, obligation: 0 });
      const monthTotals = map.get(ym)!;
      switch (tx.type) {
        case "expense":
          monthTotals.expense += tx.amount;
          break;
        case "refund":
          monthTotals.refund += tx.amount;
          break;
        case "salary":
          monthTotals.salary += tx.amount;
          break;
        case "obligation":
          monthTotals.obligation += tx.amount;
          break;
      }
    }
    return map;
  }, [transactions, paymentMethod]);

  const labels = Array.from(dataByMonth.keys()).sort();
  const expenses = labels.map((m) => dataByMonth.get(m)?.expense ?? 0);
  const refunds = labels.map((m) => dataByMonth.get(m)?.refund ?? 0);
  const salaries = labels.map((m) => dataByMonth.get(m)?.salary ?? 0);
  const obligations = labels.map((m) => dataByMonth.get(m)?.obligation ?? 0);

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
      {
        label: "Obbligazioni",
        data: obligations,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(168, 85, 247, 0.9)");
          gradient.addColorStop(1, "rgba(168, 85, 247, 0.3)");
          return gradient;
        },
        borderColor: "rgb(168, 85, 247)",
        borderWidth: 3,
        borderRadius: 10,
        hoverBackgroundColor: "rgba(168, 85, 247, 1)",
        hoverBorderWidth: 4,
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
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-base dark:bg-violet-500/10">
          📈
        </span>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            Andamento Mensile
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Visualizza spese, rimborsi e stipendi nel tempo
          </p>
        </div>
      </div>
      <div className="w-full flex-1" style={{ height: expanded ? "380px" : "260px" }}>
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
                      0,
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
                  color: "rgba(100, 116, 139, 0.12)",
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
