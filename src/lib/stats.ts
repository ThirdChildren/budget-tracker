import type { Transaction } from "@/types";

export type Totals = {
  expense: number;
  refund: number;
  salary: number;
  obligation: number;
  income: number;
  net: number;
};

// `value` sceglie l'unità (euro di default, sats con useMoney().value)
export function computeTotals(
  transactions: Transaction[],
  value: (tx: Transaction) => number = (tx) => tx.amount,
): Totals {
  const t = { expense: 0, refund: 0, salary: 0, obligation: 0 };
  for (const tx of transactions) t[tx.type] += value(tx);
  const income = t.refund + t.salary + t.obligation;
  return { ...t, income, net: income - t.expense };
}

// Variazione % rispetto a un valore precedente (null se non confrontabile)
export const percentChange = (current: number, previous: number) =>
  previous === 0 ? null : ((current - previous) / Math.abs(previous)) * 100;
