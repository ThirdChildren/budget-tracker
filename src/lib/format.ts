const eur = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const eurCompact = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatEUR = (value: number) => eur.format(value);
export const formatEURCompact = (value: number) => eurCompact.format(value);
export const formatSats = (sats: number) =>
  `${Math.round(sats).toLocaleString("it-IT")} sats`;

// "2025-05" -> "Maggio 2025"
export const formatMonth = (ym: string, opts: { short?: boolean } = {}) => {
  const [y, m] = ym.split("-").map(Number);
  const label = new Date(y, m - 1, 1).toLocaleDateString("it-IT", {
    month: opts.short ? "short" : "long",
    year: opts.short ? "2-digit" : "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const shiftMonth = (ym: string, delta: number) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const todayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(now.getDate()).padStart(2, "0")}`;
};

// "2025-05-12" -> "Lunedì 12 maggio"
export const formatDayHeading = (iso: string) => {
  const d = new Date(iso + "T00:00");
  const label = d.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const formatShortDate = (iso: string) =>
  new Date(iso + "T00:00").toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
  });

// Importo principale di una transazione: in sats solo se richiesto e disponibile
export const formatTxAmount = (
  tx: { amount: number; amountSats?: number },
  inSats: boolean,
) => (inSats && tx.amountSats ? formatSats(tx.amountSats) : formatEUR(tx.amount));
