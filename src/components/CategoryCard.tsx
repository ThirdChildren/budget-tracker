import { type FC, useMemo } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Calendar,
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
  Inbox,
  type LucideIcon,
} from "lucide-react";
import type { Transaction, PaymentMethod } from "@/types";
import React from "react";

interface Props {
  category: string;
  transactions: Transaction[];
  showInSats: boolean;
  paymentMethod: PaymentMethod;
}

type CategoryConfig = {
  icon: LucideIcon;
  iconClass: string;
};

const categoryConfig: Record<string, CategoryConfig> = {
  Trasporti: {
    icon: Car,
    iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  Casa: {
    icon: Home,
    iconClass:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  },
  Abbigliamento: {
    icon: Shirt,
    iconClass: "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
  },
  Intrattenimento: {
    icon: Film,
    iconClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  Cibo: {
    icon: UtensilsCrossed,
    iconClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  Regali: {
    icon: Gift,
    iconClass: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
  Farmacia: {
    icon: Pill,
    iconClass: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  },
  Ricarica: {
    icon: Smartphone,
    iconClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
  "Piano accumulo bitcoin": {
    icon: Bitcoin,
    iconClass:
      "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  },
  Altro: {
    icon: Package,
    iconClass:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
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
}) => {
  const filtered = useMemo(
    () => transactions.filter((t) => t.category === category),
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

  const config = categoryConfig[category] || categoryConfig["Altro"];
  const IconComponent = config.icon;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value={category}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        {/* ---------- TRIGGER ---------- */}
        <AccordionTrigger
          className="
            group flex w-full items-center justify-between gap-3 p-4 text-left
            no-underline transition-colors hover:bg-slate-50 hover:no-underline
            focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset
            dark:hover:bg-slate-800/50 sm:p-5
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                {category}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                {filtered.length} transazione{filtered.length !== 1 ? "i" : ""}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg">
              {paymentMethod === "bitcoin" && showInSats
                ? `${totalSats.toLocaleString()} sats`
                : `€ ${total.toFixed(2)}`}
            </div>
            {expenseTotal > 0 && (
              <div className="text-xs text-red-600 dark:text-red-400 sm:text-sm">
                {paymentMethod === "bitcoin" && showInSats
                  ? `-${filtered
                      .filter((t) => t.type === "expense")
                      .reduce((s, t) => s + (t.amountSats || 0), 0)
                      .toLocaleString()} sats`
                  : `-€ ${expenseTotal.toFixed(2)}`}
              </div>
            )}
            {refundTotal > 0 && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 sm:text-sm">
                {paymentMethod === "bitcoin" && showInSats
                  ? `+${filtered
                      .filter((t) => t.type === "refund")
                      .reduce((s, t) => s + (t.amountSats || 0), 0)
                      .toLocaleString()} sats`
                  : `+€ ${refundTotal.toFixed(2)}`}
              </div>
            )}
          </div>
        </AccordionTrigger>

        {/* ---------- CONTENT ---------- */}
        <AccordionContent className="space-y-2.5 border-t border-slate-100 bg-slate-50/60 px-4 pb-4 pt-3 dark:border-slate-800 dark:bg-slate-950/40 sm:px-5 sm:pb-5">
          {filtered.length === 0 && (
            <div className="py-8 text-center">
              <div className="mb-3 flex justify-center">
                <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                  <Inbox className="h-8 w-8 text-slate-400" />
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Nessuna transazione in questa categoria
              </p>
            </div>
          )}

          {filtered.map((tx) => (
            <div
              key={tx.id}
              className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(tx.date).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        transactionTypeBadges[tx.type]
                      }`}
                    >
                      {transactionTypeLabels[tx.type]}
                    </span>
                  </div>
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {tx.description}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1.5">
                    {tx.paymentMethod === "bitcoin" && (
                      <Bitcoin className="h-4 w-4 text-orange-500" />
                    )}
                    <span
                      className={`text-sm font-semibold sm:text-base ${
                        transactionTypeColors[tx.type]
                      }`}
                    >
                      {tx.type === "expense" ? "-" : "+"}
                      {paymentMethod === "bitcoin" &&
                      showInSats &&
                      tx.amountSats
                        ? `${tx.amountSats.toLocaleString()} sats`
                        : `€ ${tx.amount.toFixed(2)}`}
                    </span>
                  </div>
                  {tx.paymentMethod === "bitcoin" && tx.amountSats && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {showInSats
                        ? `€ ${tx.amount.toFixed(2)}`
                        : `${tx.amountSats.toLocaleString()} sats`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
