import { type FC, useMemo } from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Bitcoin,
  Car,
  Home,
  Shirt,
  Film,
  UtensilsCrossed,
  Gift,
  Pill,
  Smartphone,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { Transaction, PaymentMethod } from "@/types";
import React from "react";

interface Props {
  category: string;
  transactions: Transaction[];
  showInSats: boolean;
  paymentMethod: PaymentMethod;
  totalExpenses: number;
}

type CategoryConfig = {
  icon: LucideIcon;
  iconClass: string;
  barClass: string;
};

const categoryConfig: Record<string, CategoryConfig> = {
  Trasporti: {
    icon: Car,
    iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    barClass: "bg-blue-500",
  },
  Casa: {
    icon: Home,
    iconClass:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    barClass: "bg-violet-500",
  },
  Abbigliamento: {
    icon: Shirt,
    iconClass: "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
    barClass: "bg-pink-500",
  },
  Intrattenimento: {
    icon: Film,
    iconClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    barClass: "bg-amber-500",
  },
  Cibo: {
    icon: UtensilsCrossed,
    iconClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    barClass: "bg-emerald-500",
  },
  Regali: {
    icon: Gift,
    iconClass: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    barClass: "bg-red-500",
  },
  Farmacia: {
    icon: Pill,
    iconClass: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
    barClass: "bg-cyan-500",
  },
  Ricarica: {
    icon: Smartphone,
    iconClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    barClass: "bg-indigo-500",
  },
  "Piano accumulo bitcoin": {
    icon: Bitcoin,
    iconClass:
      "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    barClass: "bg-orange-500",
  },
  Altro: {
    icon: Package,
    iconClass:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    barClass: "bg-slate-500",
  },
};

const transactionTypeLabels = {
  expense: "Spesa",
  refund: "Rimborso",
  salary: "Stipendio",
  obligation: "Obbligazioni",
};

const transactionTypeColors = {
  expense: "text-red-600 dark:text-red-400",
  refund: "text-emerald-600 dark:text-emerald-400",
  salary: "text-blue-600 dark:text-blue-400",
  obligation: "text-violet-600 dark:text-violet-400",
};

const transactionTypeBadges = {
  expense: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  refund:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  salary: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  obligation:
    "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
};

export const CategoryCard: FC<Props> = ({
  category,
  transactions,
  showInSats,
  paymentMethod,
  totalExpenses,
}) => {
  // Transazioni della categoria, più recenti in alto
  const filtered = useMemo(
    () =>
      transactions
        .filter((t) => t.category === category)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, category],
  );

  const total = filtered.reduce((s, t) => s + t.amount, 0);
  const totalSats = filtered.reduce((s, t) => s + (t.amountSats || 0), 0);
  const expenseTotal = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const refundTotal = filtered
    .filter((t) => t.type === "refund")
    .reduce((s, t) => s + t.amount, 0);

  // Quota di questa categoria sul totale delle spese del periodo
  const expenseShare =
    totalExpenses > 0 ? (expenseTotal / totalExpenses) * 100 : 0;

  const config = categoryConfig[category] || categoryConfig["Altro"];
  const IconComponent = config.icon;

  const formatMain = (eur: number, sats: number) =>
    paymentMethod === "bitcoin" && showInSats
      ? `${sats.toLocaleString()} sats`
      : `€ ${eur.toFixed(2)}`;

  return (
    <AccordionItem
      value={category}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow last:border-b hover:shadow-md data-[state=open]:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      {/* ---------- TRIGGER ---------- */}
      <AccordionTrigger
        className="
          group w-full items-center gap-3 p-4 text-left no-underline
          transition-colors hover:bg-slate-50/80 hover:no-underline
          focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500
          dark:hover:bg-slate-800/40 sm:p-5
        "
      >
        <div className="flex w-full min-w-0 flex-col gap-3">
          {/* Top row: icon, name, totals */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 sm:h-11 sm:w-11 ${config.iconClass}`}
              >
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-base">
                  {category}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {filtered.length} transazione
                  {filtered.length !== 1 ? "i" : ""}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100 sm:text-base">
                {formatMain(total, totalSats)}
              </div>
              <div className="flex items-center justify-end gap-2 text-xs tabular-nums">
                {expenseTotal > 0 && (
                  <span className="text-red-600 dark:text-red-400">
                    {paymentMethod === "bitcoin" && showInSats
                      ? `-${filtered
                          .filter((t) => t.type === "expense")
                          .reduce((s, t) => s + (t.amountSats || 0), 0)
                          .toLocaleString()} sats`
                      : `-€${expenseTotal.toFixed(2)}`}
                  </span>
                )}
                {refundTotal > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {paymentMethod === "bitcoin" && showInSats
                      ? `+${filtered
                          .filter((t) => t.type === "refund")
                          .reduce((s, t) => s + (t.amountSats || 0), 0)
                          .toLocaleString()} sats`
                      : `+€${refundTotal.toFixed(2)}`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quota spese: barra di avanzamento */}
          {expenseTotal > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${config.barClass}`}
                  style={{ width: `${Math.min(expenseShare, 100)}%` }}
                />
              </div>
              <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-400 dark:text-slate-500">
                {expenseShare.toFixed(0)}% delle spese
              </span>
            </div>
          )}
        </div>
      </AccordionTrigger>

      {/* ---------- CONTENT ---------- */}
      <AccordionContent className="border-t border-slate-100 bg-slate-50/60 px-4 pb-4 pt-3 dark:border-slate-800 dark:bg-slate-950/40 sm:px-5">
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:px-4 sm:py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {tx.description}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                    {new Date(tx.date).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      transactionTypeBadges[tx.type]
                    }`}
                  >
                    {transactionTypeLabels[tx.type]}
                  </span>
                  {tx.paymentMethod === "bitcoin" && (
                    <Bitcoin className="h-3 w-3 text-orange-500" />
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    transactionTypeColors[tx.type]
                  }`}
                >
                  {tx.type === "expense" ? "-" : "+"}
                  {paymentMethod === "bitcoin" && showInSats && tx.amountSats
                    ? `${tx.amountSats.toLocaleString()} sats`
                    : `€ ${tx.amount.toFixed(2)}`}
                </span>
                {tx.paymentMethod === "bitcoin" && tx.amountSats && (
                  <span className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                    {showInSats
                      ? `€ ${tx.amount.toFixed(2)}`
                      : `${tx.amountSats.toLocaleString()} sats`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
