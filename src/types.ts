export type TransactionType = "expense" | "refund" | "salary" | "obligation";
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
  recurringId?: string; // regola ricorrente che ha generato la transazione
  recurringIndex?: number; // indice dell'occorrenza (0 = primo addebito)
}

export type RecurringKind = "subscription" | "installment";
export type Frequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

export interface RecurringRule {
  id: string; // uuid
  kind: RecurringKind;
  description: string;
  category: string;
  amount: number; // EUR per addebito (per le rate: importo della singola rata)
  frequency: Frequency;
  startDate: string; // ISO yyyy-mm-dd del primo addebito
  active: boolean; // false = in pausa
  skipBefore?: string; // ISO: le occorrenze precedenti non vengono mai registrate
  installments?: number; // solo rate: numero totale di rate
  totalAmount?: number; // solo rate: importo complessivo
  provider?: string; // solo rate: PayPal, Klarna, ...
}

// Formato del file JSON esportato (i file vecchi sono un semplice array di Transaction)
export interface BackupFile {
  version: 2;
  transactions: Transaction[];
  recurring: RecurringRule[];
}
