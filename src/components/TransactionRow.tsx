import type { FC } from "react";
import { Bitcoin } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategory, tint, TYPES } from "@/lib/config";
import { formatEUR, formatSats, formatShortDate, formatTxAmount } from "@/lib/format";
import type { Transaction } from "@/types";

interface Props {
  tx: Transaction;
  showInSats: boolean;
  showDate?: boolean;
}

export const TransactionRow: FC<Props> = ({ tx, showInSats, showDate = true }) => {
  const cat = getCategory(tx.category);
  const type = TYPES[tx.type];
  const Icon = cat.icon;
  const isBtc = tx.paymentMethod === "bitcoin" && !!tx.amountSats;

  return (
    <div className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surface-2/70 sm:px-4">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: tint(cat.color), color: cat.color }}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{tx.description}</p>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-subtle">
          <span className="truncate">{cat.name}</span>
          {showDate && (
            <>
              <span className="h-0.5 w-0.5 shrink-0 rounded-full bg-subtle" />
              <span className="shrink-0 tabular">{formatShortDate(tx.date)}</span>
            </>
          )}
          {tx.type !== "expense" && (
            <span className={cn("shrink-0 rounded-full px-1.5 py-px text-[10px] font-bold", type.bg, type.text)}>
              {type.label}
            </span>
          )}
          {tx.paymentMethod === "bitcoin" && <Bitcoin className="h-3 w-3 shrink-0 text-btc" />}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className={cn("text-sm font-bold tabular", tx.type === "expense" ? "text-ink" : type.text)}>
          {type.sign}
          {formatTxAmount(tx, showInSats)}
        </p>
        {isBtc && (
          <p className="text-[11px] text-subtle tabular">
            {showInSats ? formatEUR(tx.amount) : formatSats(tx.amountSats!)}
          </p>
        )}
      </div>
    </div>
  );
};
