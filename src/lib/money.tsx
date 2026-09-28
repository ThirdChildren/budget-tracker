import { createContext, useContext, useMemo } from "react";
import type { Transaction } from "@/types";
import { formatEUR, formatEURCompact, formatSats } from "./format";

// Unità di visualizzazione degli importi: euro oppure satoshi ("Mostra in sats")
const MoneyContext = createContext(false);

export const MoneyProvider = MoneyContext.Provider;

const satsCompact = new Intl.NumberFormat("it-IT", {
  notation: "compact",
  maximumFractionDigits: 1,
});

// Valore in sats di una transazione; per quelle vecchie senza amountSats usa il prezzo storico
export const toSats = (tx: Pick<Transaction, "amount" | "amountSats" | "btcPrice">) =>
  tx.amountSats ?? (tx.btcPrice ? Math.round((tx.amount / tx.btcPrice) * 1e8) : 0);

export function useMoney() {
  const inSats = useContext(MoneyContext);
  return useMemo(
    () => ({
      inSats,
      value: (tx: Pick<Transaction, "amount" | "amountSats" | "btcPrice">) =>
        inSats ? toSats(tx) : tx.amount,
      format: (n: number) => (inSats ? formatSats(n) : formatEUR(n)),
      formatCompact: (n: number) =>
        inSats ? `${satsCompact.format(n)} sats` : formatEURCompact(n),
    }),
    [inSats],
  );
}
