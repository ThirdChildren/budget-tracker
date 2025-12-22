export type TransactionType = "expense" | "refund" | "salary";
export type PaymentMethod = "creditCard" | "bitcoin";

export interface Transaction {
  id: string; // uuid
  date: string; // ISO yyyy‑mm‑dd
  description: string;
  category: string;
  amount: number; // positive = money out, negative = money in (in EUR)
  type: TransactionType;
  paymentMethod: PaymentMethod;
  amountSats?: number; // amount in satoshis if paymentMethod is bitcoin
  btcPrice?: number; // BTC price at the time of transaction (EUR per BTC)
}
