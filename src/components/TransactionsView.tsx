import { useMemo, useState, type FC } from "react";
import { Search, SearchX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategory, tint, TYPES, TYPE_ORDER } from "@/lib/config";
import { formatDayHeading } from "@/lib/format";
import { useMoney } from "@/lib/money";
import { computeTotals } from "@/lib/stats";
import type { Transaction, TransactionType } from "@/types";
import { TransactionRow } from "./TransactionRow";

interface Props {
  transactions: Transaction[];
  inSats: boolean;
  typeFilter: TransactionType | "all";
  onTypeFilterChange: (t: TransactionType | "all") => void;
}

export const TransactionsView: FC<Props> = ({
  transactions,
  inSats,
  typeFilter,
  onTypeFilterChange,
}) => {
  const [query, setQuery] = useState("");
  const { value, format } = useMoney();
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))),
    [transactions],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((t) => typeFilter === "all" || t.type === typeFilter)
      .filter((t) => !category || t.category === category)
      .filter(
        (t) =>
          !q ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, typeFilter, category, query]);

  // Raggruppa per giorno mantenendo l'ordine decrescente
  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of visible) {
      if (!map.has(tx.date)) map.set(tx.date, []);
      map.get(tx.date)!.push(tx);
    }
    return Array.from(map);
  }, [visible]);

  const totals = computeTotals(visible, value);
  const hasFilters = query || category || typeFilter !== "all";

  const chip = (active: boolean) =>
    cn(
      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
      active
        ? "border-transparent bg-hero text-white shadow-sm dark:bg-ink dark:text-canvas"
        : "border-line bg-surface text-ink-soft hover:border-ink/20 hover:text-ink",
    );

  return (
    <div className="space-y-4">
      {/* Filtri */}
      <div className="card animate-rise space-y-3 p-3 sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per descrizione o categoria…"
            className="w-full rounded-2xl border border-line bg-surface-2 py-3 pl-10 pr-10 text-sm placeholder:text-subtle focus:border-brand-ink/40 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/30"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-subtle hover:bg-line hover:text-ink"
              aria-label="Cancella ricerca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          <button onClick={() => onTypeFilterChange("all")} className={chip(typeFilter === "all")}>
            Tutti
          </button>
          {TYPE_ORDER.map((t) => {
            const Icon = TYPES[t].icon;
            return (
              <button key={t} onClick={() => onTypeFilterChange(t)} className={chip(typeFilter === t)}>
                <Icon className={cn("h-3.5 w-3.5", typeFilter !== t && TYPES[t].text)} />
                {TYPES[t].plural}
              </button>
            );
          })}
        </div>

        {categories.length > 1 && (
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {categories.map((c) => {
              const cfg = getCategory(c);
              const Icon = cfg.icon;
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(active ? null : c)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                    active ? "border-transparent" : "border-line bg-surface text-ink-soft hover:text-ink",
                  )}
                  style={active ? { backgroundColor: tint(cfg.color, "26"), color: cfg.color } : undefined}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                  {c}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Riepilogo risultati */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-subtle">
        <span>
          <strong className="text-ink">{visible.length}</strong> moviment{visible.length === 1 ? "o" : "i"}
          {hasFilters && (
            <button
              onClick={() => {
                setQuery("");
                setCategory(null);
                onTypeFilterChange("all");
              }}
              className="ml-2 font-semibold text-brand-ink hover:underline"
            >
              Azzera filtri
            </button>
          )}
        </span>
        <span className="flex gap-3 tabular">
          <span className="text-income">+{format(totals.income)}</span>
          <span className="text-expense">-{format(totals.expense)}</span>
        </span>
      </div>

      {groups.length === 0 ? (
        <div className="card flex flex-col items-center px-4 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-subtle">
            <SearchX className="h-7 w-7" />
          </span>
          <p className="mt-4 font-bold">Nessun movimento trovato</p>
          <p className="mt-1 text-sm text-subtle">
            {transactions.length === 0 ? "Non ci sono transazioni in questo mese" : "Prova a modificare i filtri"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(([day, txs], i) => {
            const dayTotals = computeTotals(txs, value);
            return (
              <section
                key={day}
                className="animate-rise"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <div className="mb-2 flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-subtle">
                    {formatDayHeading(day)}
                  </h3>
                  <span
                    className={cn(
                      "text-xs font-bold tabular",
                      dayTotals.net >= 0 ? "text-income" : "text-subtle",
                    )}
                  >
                    {dayTotals.net >= 0 ? "+" : ""}
                    {format(dayTotals.net)}
                  </span>
                </div>
                <div className="card divide-y divide-line overflow-hidden px-1">
                  {txs.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} showInSats={inSats} showDate={false} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
