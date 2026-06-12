import { type FC, useMemo } from "react";
import { CategoryCard } from "./CategoryCard";
import { Accordion } from "@/components/ui/accordion";
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
  // Categorie ordinate per totale decrescente + totale spese per le barre di quota
  const { categories, totalExpenses } = useMemo(() => {
    const totals = new Map<string, number>();
    let totalExpenses = 0;
    for (const t of transactions) {
      totals.set(t.category, (totals.get(t.category) || 0) + t.amount);
      if (t.type === "expense") totalExpenses += t.amount;
    }
    const categories = Array.from(totals.keys()).sort(
      (a, b) => Math.abs(totals.get(b)!) - Math.abs(totals.get(a)!),
    );
    return { categories, totalExpenses };
  }, [transactions]);

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-indigo-50 p-4 dark:bg-indigo-500/10">
            <BarChart3 className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
          </div>
        </div>
        <h3 className="mb-1.5 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Nessuna categoria
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aggiungi la tua prima transazione per vedere le categorie
        </p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-3">
      {categories.map((cat) => (
        <CategoryCard
          key={cat}
          category={cat}
          transactions={transactions}
          showInSats={showInSats}
          paymentMethod={paymentMethod}
          totalExpenses={totalExpenses}
        />
      ))}
    </Accordion>
  );
};
