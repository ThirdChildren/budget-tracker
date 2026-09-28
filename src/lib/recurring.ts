import type { Frequency, RecurringRule, Transaction } from "@/types";

export const FREQUENCIES: Record<Frequency, { label: string; short: string; perMonth: number }> = {
  weekly: { label: "Settimanale", short: "sett.", perMonth: 52 / 12 },
  biweekly: { label: "Ogni 2 settimane", short: "2 sett.", perMonth: 26 / 12 },
  monthly: { label: "Mensile", short: "mese", perMonth: 1 },
  quarterly: { label: "Trimestrale", short: "trim.", perMonth: 1 / 3 },
  yearly: { label: "Annuale", short: "anno", perMonth: 1 / 12 },
};

export const PROVIDERS = ["PayPal", "Klarna", "Scalapay", "Carta", "Altro"];

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (iso: string) => iso.split("-").map(Number) as [number, number, number];

const addDays = (iso: string, days: number) => {
  const [y, m, d] = parse(iso);
  return toISO(new Date(y, m - 1, d + days));
};

// Stesso giorno del mese, limitato all'ultimo giorno (31 gen -> 28/29 feb)
const addMonths = (iso: string, months: number) => {
  const [y, m, d] = parse(iso);
  const lastDay = new Date(y, m - 1 + months + 1, 0).getDate();
  return toISO(new Date(y, m - 1 + months, Math.min(d, lastDay)));
};

export const occurrenceDate = (rule: RecurringRule, k: number) => {
  switch (rule.frequency) {
    case "weekly":
      return addDays(rule.startDate, 7 * k);
    case "biweekly":
      return addDays(rule.startDate, 14 * k);
    case "monthly":
      return addMonths(rule.startDate, k);
    case "quarterly":
      return addMonths(rule.startDate, 3 * k);
    case "yearly":
      return addMonths(rule.startDate, 12 * k);
  }
};

// Importo della k-esima occorrenza: per le rate l'ultima assorbe l'arrotondamento
export const occurrenceAmount = (rule: RecurringRule, k: number) => {
  if (rule.kind !== "installment" || !rule.installments || rule.totalAmount == null) {
    return rule.amount;
  }
  const n = rule.installments;
  const base = Math.floor((rule.totalAmount * 100) / n) / 100;
  return k === n - 1 ? Math.round((rule.totalAmount - base * (n - 1)) * 100) / 100 : base;
};

export const installmentAmount = (total: number, n: number) =>
  Math.floor((total * 100) / n) / 100;

const maxOccurrences = (rule: RecurringRule) =>
  rule.kind === "installment" ? (rule.installments ?? 0) : 5000;

const doneKeys = (transactions: Transaction[]) =>
  new Set(
    transactions
      .filter((t) => t.recurringId)
      .map((t) => `${t.recurringId}#${t.recurringIndex}`),
  );

const buildTransaction = (rule: RecurringRule, k: number): Omit<Transaction, "id"> => ({
  date: occurrenceDate(rule, k),
  description:
    rule.kind === "installment"
      ? `${rule.description} (rata ${k + 1}/${rule.installments})`
      : rule.description,
  category: rule.category,
  amount: occurrenceAmount(rule, k),
  type: "expense",
  paymentMethod: "creditCard",
  recurringId: rule.id,
  recurringIndex: k,
});

/**
 * Addebiti con data <= oggi non ancora registrati. Idempotente: una transazione
 * già presente con stesso recurringId e recurringIndex non viene ricreata.
 */
export function generateDue(
  rules: RecurringRule[],
  transactions: Transaction[],
  today: string,
): Omit<Transaction, "id">[] {
  const done = doneKeys(transactions);
  const due: Omit<Transaction, "id">[] = [];
  for (const rule of rules) {
    if (!rule.active) continue;
    for (let k = 0; k < maxOccurrences(rule); k++) {
      const date = occurrenceDate(rule, k);
      if (date > today) break;
      if (rule.skipBefore && date < rule.skipBefore) continue;
      if (done.has(`${rule.id}#${k}`)) continue;
      due.push(buildTransaction(rule, k));
    }
  }
  return due.sort((a, b) => a.date.localeCompare(b.date));
}

/** Occorrenze passate che verrebbero registrate creando la regola oggi. */
export const pastOccurrences = (rule: RecurringRule, today: string) =>
  generateDue([{ ...rule, active: true, skipBefore: undefined }], [], today).length;

export type RuleStatus = {
  paid: number; // occorrenze registrate
  paidAmount: number;
  next: { date: string; amount: number; index: number } | null;
  completed: boolean;
};

export function ruleStatus(
  rule: RecurringRule,
  transactions: Transaction[],
  today: string,
): RuleStatus {
  const mine = transactions.filter((t) => t.recurringId === rule.id);
  const done = new Set(mine.map((t) => t.recurringIndex));
  const max = maxOccurrences(rule);
  let next: RuleStatus["next"] = null;
  for (let k = 0; k < max; k++) {
    if (done.has(k)) continue;
    const date = occurrenceDate(rule, k);
    if (rule.skipBefore && date < rule.skipBefore) continue;
    if (!rule.active && date < today) continue;
    next = { date, amount: occurrenceAmount(rule, k), index: k };
    break;
  }
  return {
    paid: mine.length,
    paidAmount: mine.reduce((s, t) => s + t.amount, 0),
    next,
    completed: rule.kind === "installment" && next === null,
  };
}

/** Prossimi addebiti di tutte le regole attive entro `days` giorni. */
export function upcomingCharges(
  rules: RecurringRule[],
  transactions: Transaction[],
  today: string,
  days: number,
) {
  const limit = addDays(today, days);
  const done = doneKeys(transactions);
  const out: { rule: RecurringRule; date: string; amount: number; index: number }[] = [];
  for (const rule of rules) {
    if (!rule.active) continue;
    for (let k = 0; k < maxOccurrences(rule); k++) {
      const date = occurrenceDate(rule, k);
      if (date > limit) break;
      if (date < today || done.has(`${rule.id}#${k}`)) continue;
      if (rule.skipBefore && date < rule.skipBefore) continue;
      out.push({ rule, date, amount: occurrenceAmount(rule, k), index: k });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export const daysUntil = (iso: string, today: string) => {
  const [y1, m1, d1] = parse(today);
  const [y2, m2, d2] = parse(iso);
  return Math.round(
    (new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()) / 86_400_000,
  );
};

export const relativeDay = (iso: string, today: string) => {
  const n = daysUntil(iso, today);
  if (n === 0) return "oggi";
  if (n === 1) return "domani";
  if (n < 0) return `${-n} giorni fa`;
  return `tra ${n} giorni`;
};
