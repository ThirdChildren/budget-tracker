export type TransactionType = "expense" | "refund" | "salary";

export interface Transaction {
  id: string; // uuid
  date: string; // ISO yyyy‑mm‑dd
  description: string;
  category: string;
  amount: number; // positive = money out, negative = money in
  type: TransactionType;
}
