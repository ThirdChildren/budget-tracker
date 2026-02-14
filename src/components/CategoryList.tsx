import { type FC, useMemo } from "react";
import { CategoryCard } from "./CategoryCard";
import type { Transaction, PaymentMethod } from "../types";
import { BarChart3 } from "lucide-react";
import React from "react";

interface Props {
  transactions: Transaction[];
  showInSats: boolean;
  paymentMethod: PaymentMethod;
}

export const CategoryList: FC<Props> = ({
  transactions,
  showInSats,
  paymentMethod,
}) => {
  const categories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))),
    [transactions],
  );

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full">
            <BarChart3 className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Nessuna categoria
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Aggiungi la tua prima transazione per vedere le categorie
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {categories.map((cat) => (
        <CategoryCard
          key={cat}
          category={cat}
          transactions={transactions}
          showInSats={showInSats}
          paymentMethod={paymentMethod}
        />
      ))}
    </div>
  );
};
