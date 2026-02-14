import { type FC, useMemo } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Calendar,
  FileText,
  DollarSign,
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
  color: string;
  gradient: string;
};

const categoryConfig: Record<string, CategoryConfig> = {
  Trasporti: {
    icon: Car,
    color: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500 to-cyan-500",
  },
  Casa: {
    icon: Home,
    color: "text-purple-600 dark:text-purple-400",
    gradient: "from-purple-500 to-pink-500",
  },
  Abbigliamento: {
    icon: Shirt,
    color: "text-pink-600 dark:text-pink-400",
    gradient: "from-pink-500 to-rose-500",
  },
  Intrattenimento: {
    icon: Film,
    color: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-500 to-amber-500",
  },
  Cibo: {
    icon: UtensilsCrossed,
    color: "text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-500 to-teal-500",
  },
  Regali: {
    icon: Gift,
    color: "text-red-600 dark:text-red-400",
    gradient: "from-red-500 to-pink-500",
  },
  Farmacia: {
    icon: Pill,
    color: "text-cyan-600 dark:text-cyan-400",
    gradient: "from-cyan-500 to-blue-500",
  },
  Ricarica: {
    icon: Smartphone,
    color: "text-violet-600 dark:text-violet-400",
    gradient: "from-violet-500 to-purple-500",
  },
  "Piano accumulo bitcoin": {
    icon: Bitcoin,
    color: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-500 to-yellow-500",
  },
  Altro: {
    icon: Package,
    color: "text-slate-600 dark:text-slate-400",
    gradient: "from-slate-500 to-gray-500",
  },
};

const transactionTypeLabels = {
  expense: "Spesa",
  refund: "Rimborso",
  salary: "Stipendio",
};

const transactionTypeColors = {
  expense: "text-red-600 dark:text-red-400",
  refund: "text-green-600 dark:text-green-400",
  salary: "text-blue-600 dark:text-blue-400",
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
      <AccordionItem value={category} className="border-0">
        {/* ---------- TRIGGER ---------- */}
        <AccordionTrigger
          className="
            w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700
            flex items-center justify-between p-6
            rounded-2xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700
            transition-all duration-200 hover:-translate-y-0.5
            focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
            text-left group no-underline hover:no-underline
          "
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3
                className={`text-lg font-semibold text-slate-900 dark:text-slate-100 ${config.color} transition-all`}
              >
                {category}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {filtered.length} transazione{filtered.length !== 1 ? "i" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {paymentMethod === "bitcoin" && showInSats
                  ? `${totalSats.toLocaleString()} sats`
                  : `€ ${total.toFixed(2)}`}
              </div>
              {expenseTotal > 0 && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {paymentMethod === "bitcoin" && showInSats
                    ? `-${filtered
                        .filter((t) => t.type === "expense")
                        .reduce((s, t) => s + (t.amountSats || 0), 0)
                        .toLocaleString()} sats`
                    : `-€ ${expenseTotal.toFixed(2)}`}
                </div>
              )}
              {refundTotal > 0 && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  {paymentMethod === "bitcoin" && showInSats
                    ? `+${filtered
                        .filter((t) => t.type === "refund")
                        .reduce((s, t) => s + (t.amountSats || 0), 0)
                        .toLocaleString()} sats`
                    : `+€ ${refundTotal.toFixed(2)}`}
                </div>
              )}
            </div>
          </div>
        </AccordionTrigger>

        {/* ---------- CONTENT ---------- */}
        <AccordionContent className="bg-slate-50 dark:bg-slate-900/50 px-6 pb-6 pt-4 space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Inbox className="w-10 h-10 text-slate-400" />
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
              className="
                bg-white dark:bg-slate-800 rounded-xl p-4
                border border-slate-200 dark:border-slate-700
                hover:shadow-sm transition-all duration-200
              "
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(tx.date).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        tx.type === "expense"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : tx.type === "refund"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {transactionTypeLabels[tx.type]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {tx.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    {tx.paymentMethod === "bitcoin" ? (
                      <Bitcoin className="w-4 h-4 text-orange-500" />
                    ) : (
                      <DollarSign className="w-4 h-4 text-slate-400" />
                    )}
                    <span
                      className={`font-semibold ${
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
