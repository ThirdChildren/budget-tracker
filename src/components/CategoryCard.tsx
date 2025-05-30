import { type FC, useState, useMemo } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import type { Transaction } from "../types";
import React from "react";

interface Props {
  category: string;
  transactions: Transaction[];
}

export const CategoryCard: FC<Props> = ({ category, transactions }) => {
  const [open, setOpen] = useState(false);
  const filtered = useMemo(
    () => transactions.filter((t) => t.category === category),
    [transactions, category]
  );
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={category}>
        <AccordionTrigger onClick={() => setOpen((o) => !o)}>
          <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow">
            <span className="font-semibold">{category}</span>
            <span className="font-medium">€ {total.toFixed(2)}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="mt-2 space-y-1">
            {filtered.map((tx) => (
              <li
                key={tx.id}
                className="flex justify-between px-4 py-2 bg-slate-50 rounded"
              >
                <span>
                  {tx.date} - {tx.description} ({tx.type})
                </span>
                <span>€ {tx.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
