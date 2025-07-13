import { type FC, useMemo } from "react";
import { CategoryCard } from "./CategoryCard";
import type { Transaction } from "../types";
import React from "react";

interface Props {
  transactions: Transaction[];
}

export const CategoryList: FC<Props> = ({ transactions }) => {
  const categories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))),
    [transactions]
  );

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
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
        <CategoryCard key={cat} category={cat} transactions={transactions} />
      ))}
    </div>
  );
};
