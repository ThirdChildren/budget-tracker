import { useMemo, useState, type FC } from "react";
import { CalendarClock, CreditCard, Plus, Repeat, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEUR, formatShortDate } from "@/lib/format";
import { FREQUENCIES, ruleStatus, upcomingCharges } from "@/lib/recurring";
import type { RecurringKind, RecurringRule, Transaction } from "@/types";
import { RuleCard } from "./RuleCard";
import { UpcomingList } from "./UpcomingList";

interface Props {
  rules: RecurringRule[];
  transactions: Transaction[];
  today: string;
  onCreate: (kind: RecurringKind) => void;
  onEdit: (rule: RecurringRule) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const RecurringView: FC<Props> = ({
  rules,
  transactions,
  today,
  onCreate,
  onEdit,
  onToggle,
  onDelete,
}) => {
  const [tab, setTab] = useState<RecurringKind>("subscription");

  const statuses = useMemo(
    () => new Map(rules.map((r) => [r.id, ruleStatus(r, transactions, today)])),
    [rules, transactions, today],
  );
  const upcoming = useMemo(
    () => upcomingCharges(rules, transactions, today, 30),
    [rules, transactions, today],
  );

  const subs = rules.filter((r) => r.kind === "subscription");
  const plans = rules.filter((r) => r.kind === "installment");
  const activeSubs = subs.filter((r) => r.active).length;
  const monthlySubs = subs
    .filter((r) => r.active)
    .reduce((s, r) => s + r.amount * FREQUENCIES[r.frequency].perMonth, 0);
  const openPlans = plans.filter((r) => !statuses.get(r.id)!.completed);
  const debt = openPlans.reduce(
    (s, r) => s + Math.max(0, (r.totalAmount ?? 0) - statuses.get(r.id)!.paidAmount),
    0,
  );
  const next = upcoming[0];
  const list = tab === "subscription" ? subs : plans;

  const tiles = [
    {
      icon: Repeat,
      label: "Abbonamenti al mese",
      value: formatEUR(monthlySubs),
      hint: `${activeSubs} attiv${activeSubs === 1 ? "o" : "i"} · ≈ ${formatEUR(monthlySubs * 12)}/anno`,
      color: "#8b5cf6",
    },
    {
      icon: Wallet,
      label: "Rate da pagare",
      value: formatEUR(debt),
      hint: `${openPlans.length} pian${openPlans.length === 1 ? "o" : "i"} in corso`,
      color: "#0ea5e9",
    },
    {
      icon: CalendarClock,
      label: "Prossimo addebito",
      value: next ? formatEUR(next.amount) : "—",
      hint: next ? `${next.rule.description} · ${formatShortDate(next.date)}` : "nessuno nei prossimi 30 giorni",
      color: "#f43f5e",
    },
  ];

  if (rules.length === 0) {
    return (
      <div className="card animate-rise flex flex-col items-center px-6 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand/40 text-ink dark:bg-brand/10 dark:text-brand">
          <Repeat className="h-8 w-8" />
        </span>
        <h2 className="mt-5 text-xl font-extrabold tracking-tight">Automatizza le spese fisse</h2>
        <p className="mt-2 max-w-md text-sm text-subtle">
          Aggiungi abbonamenti (Netflix, palestra, telefono…) e pagamenti a rate (PayPal in 3, Klarna…).
          Ogni volta che importi il tuo JSON, gli addebiti arrivati a scadenza vengono registrati da soli.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => onCreate("subscription")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-hero px-5 py-3 text-sm font-bold text-white shadow-lg shadow-hero/20 dark:bg-brand dark:text-hero"
          >
            <Repeat className="h-4 w-4" /> Nuovo abbonamento
          </button>
          <button
            onClick={() => onCreate("installment")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line px-5 py-3 text-sm font-bold hover:bg-surface-2"
          >
            <CreditCard className="h-4 w-4" /> Nuovo pagamento a rate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* su mobile i riquadri scorrono in orizzontale */}
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0">
        {tiles.map(({ icon: Icon, label, value, hint, color }, i) => (
          <div key={label} className="card animate-rise min-w-[78%] snap-start p-4 sm:min-w-0 sm:p-5" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}1f`, color }}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-xs font-semibold text-subtle sm:text-sm">{label}</p>
            </div>
            <p className="mt-3 truncate text-2xl font-extrabold tracking-tight tabular">{value}</p>
            <p className="mt-0.5 truncate text-xs text-subtle">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-2xl border border-line bg-surface p-1">
              {(
                [
                  { id: "subscription", label: "Abbonamenti", count: subs.length },
                  { id: "installment", label: "Rate", count: plans.length },
                ] as const
              ).map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all",
                    tab === id ? "bg-hero text-white shadow-sm dark:bg-surface-2 dark:text-ink" : "text-subtle hover:text-ink",
                  )}
                >
                  {label}
                  <span className={cn("rounded-full px-1.5 text-[11px]", tab === id ? "bg-white/15" : "bg-surface-2")}>{count}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => onCreate(tab)}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand px-4 py-2.5 text-sm font-bold text-hero shadow-md shadow-brand/30 transition-transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" strokeWidth={3} />
              {tab === "subscription" ? "Abbonamento" : "Piano rate"}
            </button>
          </div>

          {list.length === 0 ? (
            <div className="card flex flex-col items-center px-4 py-12 text-center">
              <p className="font-bold">
                {tab === "subscription" ? "Nessun abbonamento" : "Nessun pagamento a rate"}
              </p>
              <p className="mt-1 text-sm text-subtle">Usa il pulsante qui sopra per aggiungerne uno.</p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {list.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  status={statuses.get(rule.id)!}
                  today={today}
                  onEdit={() => onEdit(rule)}
                  onToggle={() => onToggle(rule.id)}
                  onDelete={() => onDelete(rule.id)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="card animate-rise p-4 lg:sticky lg:top-32" style={{ animationDelay: "120ms" }}>
          <h2 className="px-2 pt-1 text-base font-bold">Prossimi 30 giorni</h2>
          <p className="px-2 text-xs text-subtle">
            {upcoming.length > 0
              ? `${upcoming.length} addebit${upcoming.length === 1 ? "o" : "i"} · ${formatEUR(upcoming.reduce((s, u) => s + u.amount, 0))}`
              : "Nessun addebito in arrivo"}
          </p>
          {upcoming.length > 0 && (
            <div className="mt-3">
              <UpcomingList items={upcoming} today={today} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
