import type { FC } from "react";
import { getCategory } from "@/lib/config";
import { formatEUR } from "@/lib/format";
import { daysUntil, relativeDay, upcomingCharges } from "@/lib/recurring";
import { cn } from "@/lib/utils";

interface Props {
  items: ReturnType<typeof upcomingCharges>;
  today: string;
}

// Prossimi addebiti in una striscia orizzontale scorrevole
export const UpcomingStrip: FC<Props> = ({ items, today }) => (
  <div className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0 lg:[mask-image:linear-gradient(to_right,black_90%,transparent)]">
    {items.map(({ rule, date, amount, index }) => {
      const cat = getCategory(rule.category);
      const soon = daysUntil(date, today) <= 3;
      const [, , d] = date.split("-");
      const month = new Date(date + "T00:00")
        .toLocaleDateString("it-IT", { month: "short" })
        .replace(".", "");
      return (
        <div
          key={`${rule.id}#${index}`}
          className="card relative w-44 shrink-0 snap-start overflow-hidden p-4"
        >
          <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: cat.color }} />
          <div className="flex items-baseline justify-between gap-2">
            <p className="leading-none">
              <span className="text-2xl font-extrabold tabular">{Number(d)}</span>
              <span className="ml-1 text-xs font-bold uppercase text-subtle">{month}</span>
            </p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                soon ? "bg-expense/10 text-expense" : "bg-surface-2 text-subtle",
              )}
            >
              {relativeDay(date, today)}
            </span>
          </div>
          <p className="mt-4 truncate text-sm font-semibold">{rule.description}</p>
          <p className="truncate text-xs text-subtle">
            {rule.kind === "installment" ? `Rata ${index + 1} di ${rule.installments}` : cat.name}
          </p>
          <p className="mt-2 font-extrabold tabular">-{formatEUR(amount)}</p>
        </div>
      );
    })}
  </div>
);
