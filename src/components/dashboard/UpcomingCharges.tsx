import { useMemo, type FC } from "react";
import { ArrowRight } from "lucide-react";
import { formatEUR } from "@/lib/format";
import { upcomingCharges } from "@/lib/recurring";
import type { RecurringRule, Transaction } from "@/types";
import { UpcomingList } from "../recurring/UpcomingList";

interface Props {
  rules: RecurringRule[];
  transactions: Transaction[];
  today: string;
  onManage: () => void;
}

export const UpcomingCharges: FC<Props> = ({ rules, transactions, today, onManage }) => {
  const items = useMemo(() => upcomingCharges(rules, transactions, today, 30), [rules, transactions, today]);
  if (rules.length === 0) return null;

  return (
    <section className="card animate-rise p-3" style={{ animationDelay: "160ms" }}>
      <div className="flex items-center justify-between px-2 pb-1 pt-2">
        <div>
          <h2 className="text-base font-bold">In arrivo</h2>
          <p className="text-xs text-subtle">
            {items.length
              ? `${formatEUR(items.reduce((s, i) => s + i.amount, 0))} nei prossimi 30 giorni`
              : "Nessun addebito nei prossimi 30 giorni"}
          </p>
        </div>
        <button onClick={onManage} className="group inline-flex items-center gap-1 text-xs font-semibold text-brand-ink hover:underline">
          Gestisci
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      {items.length > 0 && (
        <div className="mt-2">
          <UpcomingList items={items.slice(0, 4)} today={today} />
        </div>
      )}
    </section>
  );
};
