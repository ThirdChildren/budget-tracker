import type { FC } from "react";
import { getCategory, tint } from "@/lib/config";
import { formatEUR, formatShortDate } from "@/lib/format";
import { daysUntil, relativeDay, upcomingCharges } from "@/lib/recurring";
import { cn } from "@/lib/utils";

interface Props {
  items: ReturnType<typeof upcomingCharges>;
  today: string;
}

export const UpcomingList: FC<Props> = ({ items, today }) => (
  <ul className="space-y-1">
    {items.map(({ rule, date, amount, index }) => {
      const cat = getCategory(rule.category);
      const Icon = cat.icon;
      const soon = daysUntil(date, today) <= 3;
      return (
        <li key={`${rule.id}#${index}`} className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-surface-2">
          <div className="flex w-11 shrink-0 flex-col items-center rounded-xl border border-line py-1 leading-none">
            <span className="text-[10px] font-bold uppercase text-subtle">
              {formatShortDate(date).split(" ")[1]?.replace(".", "")}
            </span>
            <span className="text-base font-extrabold tabular">{Number(date.slice(8, 10))}</span>
          </div>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: tint(cat.color), color: cat.color }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {rule.description}
              {rule.kind === "installment" && (
                <span className="font-medium text-subtle"> · rata {index + 1}/{rule.installments}</span>
              )}
            </p>
            <p className={cn("text-xs", soon ? "font-semibold text-expense" : "text-subtle")}>
              {relativeDay(date, today)}
            </p>
          </div>
          <span className="shrink-0 text-sm font-bold tabular">-{formatEUR(amount)}</span>
        </li>
      );
    })}
  </ul>
);
