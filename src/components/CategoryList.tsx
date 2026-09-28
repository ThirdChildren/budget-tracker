import { type FC, useMemo, useState } from "react";
import { Shapes } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { getCategory } from "@/lib/config";
import { useMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Transaction } from "../types";
import { CategoryCard } from "./CategoryCard";

interface Props {
  transactions: Transaction[];
  inSats: boolean;
}

export const CategoryList: FC<Props> = ({ transactions, inSats }) => {
  const [open, setOpen] = useState("");
  const { value, format } = useMoney();

  // Categorie ordinate per totale decrescente + quote spese per la barra segmentata
  const { categories, totalExpenses, expenseByCat } = useMemo(() => {
    const totals = new Map<string, number>();
    const expenseByCat = new Map<string, number>();
    let totalExpenses = 0;
    for (const t of transactions) {
      totals.set(t.category, (totals.get(t.category) || 0) + value(t));
      if (t.type === "expense") {
        totalExpenses += value(t);
        expenseByCat.set(t.category, (expenseByCat.get(t.category) || 0) + value(t));
      }
    }
    const categories = Array.from(totals.keys()).sort(
      (a, b) => Math.abs(totals.get(b)!) - Math.abs(totals.get(a)!),
    );
    return { categories, totalExpenses, expenseByCat };
  }, [transactions, value]);

  return (
    <section className="card animate-rise p-4 sm:p-5" style={{ animationDelay: "160ms" }}>
      <div className="mb-4 flex items-end justify-between gap-3 px-1">
        <div>
          <h2 className="text-base font-bold">Categorie</h2>
          <p className="text-xs text-subtle">Tocca una categoria per vedere i dettagli</p>
        </div>
        {totalExpenses > 0 && (
          <p className="text-right text-xs text-subtle">
            Spesi
            <span className="block text-base font-extrabold text-ink tabular">{format(totalExpenses)}</span>
          </p>
        )}
      </div>

      {/* Barra segmentata: distribuzione delle spese, cliccabile */}
      {totalExpenses > 0 && (
        <div className="mb-4 flex h-3 gap-0.5 overflow-hidden rounded-full">
          {categories
            .filter((c) => expenseByCat.get(c))
            .map((c) => {
              const share = (expenseByCat.get(c)! / totalExpenses) * 100;
              return (
                <button
                  key={c}
                  title={`${c}: ${share.toFixed(0)}%`}
                  onClick={() => setOpen(open === c ? "" : c)}
                  className={cn(
                    "animate-grow-x h-full min-w-1 transition-opacity",
                    open && open !== c && "opacity-30",
                  )}
                  style={{ width: `${share}%`, backgroundColor: getCategory(c).color }}
                />
              );
            })}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-4 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/30 text-brand-ink dark:bg-brand/10">
            <Shapes className="h-7 w-7" />
          </span>
          <h3 className="mt-4 text-base font-bold">Nessuna categoria</h3>
          <p className="mt-1 max-w-xs text-sm text-subtle">
            Aggiungi la prima transazione del mese per vedere dove vanno i tuoi soldi
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="space-y-2.5">
          {categories.map((cat) => (
            <CategoryCard
              key={cat}
              category={cat}
              transactions={transactions}
              inSats={inSats}
              totalExpenses={totalExpenses}
            />
          ))}
        </Accordion>
      )}
    </section>
  );
};
