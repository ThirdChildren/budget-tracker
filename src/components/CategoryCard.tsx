import { type FC, useMemo } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";
import type { Transaction } from "@/types";
import React from "react";

interface Props {
  category: string;
  transactions: Transaction[];
}

export const CategoryCard: FC<Props> = ({ category, transactions }) => {
  const filtered = useMemo(
    () => transactions.filter((t) => t.category === category),
    [transactions, category]
  );
  const total = filtered.reduce((s, t) => s + t.amount, 0);

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={category} className="overflow-hidden">
        {/* ---------- TRIGGER ---------- */}
        <AccordionTrigger
          className="
            w-full bg-slate-100 hover:bg-slate-200
            dark:bg-slate-800 dark:hover:bg-slate-700
            flex items-center justify-between pl-4 pr-3 py-3
            rounded-xl shadow-sm transition-colors
            focus-visible:ring-2 focus-visible:ring-ring
            text-base font-medium
          "
        >
          <span>{category}</span>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              € {total.toFixed(2)}
            </span>
            <ChevronDown className="size-4 shrink-0 transition-transform data-[state=open]:rotate-180" />
          </div>
        </AccordionTrigger>

        {/* ---------- CONTENT ---------- */}
        <AccordionContent className="bg-white dark:bg-slate-900 px-4 pb-4 pt-2 space-y-1">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-500">Nessuna voce</p>
          )}

          {filtered.map((tx) => (
            <div
              key={tx.id}
              className="
                flex justify-between items-center
                rounded-lg bg-slate-50 dark:bg-slate-800
                px-3 py-1.5 text-sm
              "
            >
              <span className="truncate">
                {tx.date} — {tx.description} ({tx.type})
              </span>
              <span className="font-medium">€ {tx.amount.toFixed(2)}</span>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
