import { type FC, useMemo } from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { getCategory, tint } from "@/lib/config";
import { useMoney } from "@/lib/money";
import type { Transaction } from "@/types";
import { TransactionRow } from "./TransactionRow";

interface Props {
  category: string;
  transactions: Transaction[];
  inSats: boolean;
  totalExpenses: number;
}

export const CategoryCard: FC<Props> = ({
  category,
  transactions,
  inSats,
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

  const { value, format } = useMoney();
  const sum = (txs: Transaction[]) => txs.reduce((s, t) => s + value(t), 0);
  const expenses = sum(filtered.filter((t) => t.type === "expense"));
  const incoming = sum(filtered.filter((t) => t.type !== "expense"));

  // Quota di questa categoria sul totale delle spese del periodo
  const expenseShare = totalExpenses > 0 ? (expenses / totalExpenses) * 100 : 0;

  const cat = getCategory(category);
  const Icon = cat.icon;

  return (
    <AccordionItem
      value={category}
      className="overflow-hidden rounded-2xl border border-line bg-surface transition-all last:border-b hover:border-ink/15 data-[state=open]:shadow-lg data-[state=open]:shadow-ink/5"
    >
      <AccordionTrigger className="group w-full items-center gap-3 px-4 py-3.5 text-left hover:no-underline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-ink sm:px-5">
        <div className="flex w-full min-w-0 items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 group-hover:-rotate-3"
            style={{ backgroundColor: tint(cat.color), color: cat.color }}
          >
            <Icon className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="truncate text-sm font-bold sm:text-[15px]">{category}</h3>
              <span className="shrink-0 text-sm font-extrabold tabular sm:text-base">
                {expenses > 0 ? format(expenses) : `+${format(incoming)}`}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="animate-grow-x h-full rounded-full"
                  style={{ width: `${Math.min(expenseShare, 100)}%`, backgroundColor: cat.color }}
                />
              </div>
              <span className="w-24 shrink-0 text-right text-[11px] font-medium text-subtle tabular">
                {expenses > 0 ? `${expenseShare.toFixed(0)}% · ` : ""}
                {filtered.length} mov.
              </span>
            </div>

            {expenses > 0 && incoming > 0 && (
              <p className="mt-1 text-[11px] font-semibold text-income tabular">
                +{format(incoming)} rientrati
              </p>
            )}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="border-t border-line bg-surface-2/40 px-1 pb-1 pt-1">
        <div className="divide-y divide-line">
          {filtered.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} showInSats={inSats} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
