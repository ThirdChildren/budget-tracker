import { useMemo, type FC } from "react";
import { ArrowRight, Inbox } from "lucide-react";
import type { Transaction } from "@/types";
import { TransactionRow } from "../TransactionRow";

interface Props {
  transactions: Transaction[];
  showInSats: boolean;
  onSeeAll: () => void;
}

export const RecentTransactions: FC<Props> = ({ transactions, showInSats, onSeeAll }) => {
  const recent = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [transactions],
  );

  return (
    <section className="card animate-rise overflow-hidden" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <h2 className="text-base font-bold">Ultimi movimenti</h2>
        {transactions.length > 0 && (
          <button
            onClick={onSeeAll}
            className="group inline-flex items-center gap-1 text-xs font-semibold text-brand-ink hover:underline"
          >
            Vedi tutti
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center px-5 pb-8 pt-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-subtle">
            <Inbox className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-semibold">Nessun movimento</p>
          <p className="mt-1 text-xs text-subtle">Le transazioni del mese appariranno qui</p>
        </div>
      ) : (
        <div className="divide-y divide-line px-1 pb-2">
          {recent.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} showInSats={showInSats} />
          ))}
        </div>
      )}
    </section>
  );
};
