import { useMemo, useState, type FC, type ReactNode } from "react";
import { ChevronDown, CreditCard, Plus, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEUR } from "@/lib/format";
import { FREQUENCIES, ruleStatus, upcomingCharges } from "@/lib/recurring";
import type { RecurringKind, RecurringRule, Transaction } from "@/types";
import { SubscriptionList } from "./SubscriptionList";
import { CompletedInstallment, InstallmentCard } from "./InstallmentCard";
import { UpcomingStrip } from "./UpcomingStrip";

interface Props {
  rules: RecurringRule[];
  transactions: Transaction[];
  today: string;
  onCreate: (kind: RecurringKind) => void;
  onOpen: (rule: RecurringRule) => void;
}

const SectionHeader: FC<{
  title: string;
  subtitle: string;
  action?: ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="mb-4 flex items-end justify-between gap-4">
    <div className="min-w-0">
      <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
      <p className="truncate text-sm text-subtle">{subtitle}</p>
    </div>
    {action}
  </div>
);

const AddButton: FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-bold transition-colors hover:border-ink/20 hover:bg-surface-2"
  >
    <Plus className="h-4 w-4" strokeWidth={2.5} />
    {label}
  </button>
);

const EmptySection: FC<{ text: string; cta: string; onClick: () => void }> = ({ text, cta, onClick }) => (
  <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line px-6 py-10 text-center">
    <p className="text-sm text-subtle">{text}</p>
    <button onClick={onClick} className="text-sm font-bold text-brand-ink hover:underline">
      {cta}
    </button>
  </div>
);

export const RecurringView: FC<Props> = ({ rules, transactions, today, onCreate, onOpen }) => {
  const [showCompleted, setShowCompleted] = useState(false);

  const statuses = useMemo(
    () => new Map(rules.map((r) => [r.id, ruleStatus(r, transactions, today)])),
    [rules, transactions, today],
  );
  const upcoming = useMemo(
    () => upcomingCharges(rules, transactions, today, 30),
    [rules, transactions, today],
  );

  // Abbonamenti: attivi in ordine di prossimo addebito, quelli in pausa in fondo
  const subs = useMemo(
    () =>
      rules
        .filter((r) => r.kind === "subscription")
        .sort((a, b) => {
          if (a.active !== b.active) return a.active ? -1 : 1;
          const na = statuses.get(a.id)?.next?.date ?? "9999";
          const nb = statuses.get(b.id)?.next?.date ?? "9999";
          return na.localeCompare(nb);
        }),
    [rules, statuses],
  );
  const plans = rules.filter((r) => r.kind === "installment");
  const openPlans = plans.filter((r) => !statuses.get(r.id)!.completed);
  const completedPlans = plans.filter((r) => statuses.get(r.id)!.completed);

  const activeSubs = subs.filter((r) => r.active);
  const monthlySubs = activeSubs.reduce((s, r) => s + r.amount * FREQUENCIES[r.frequency].perMonth, 0);
  const debt = openPlans.reduce(
    (s, r) => s + Math.max(0, (r.totalAmount ?? 0) - statuses.get(r.id)!.paidAmount),
    0,
  );
  const upcomingTotal = upcoming.reduce((s, u) => s + u.amount, 0);

  if (rules.length === 0) {
    return (
      <div className="card animate-rise flex flex-col items-center px-6 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand/40 text-ink dark:bg-brand/10 dark:text-brand">
          <Repeat className="h-8 w-8" />
        </span>
        <h2 className="mt-6 text-xl font-extrabold tracking-tight">Automatizza le spese fisse</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-subtle">
          Aggiungi abbonamenti (Netflix, palestra, telefono…) e pagamenti a rate (PayPal in 3, Klarna…).
          Ogni volta che importi il tuo JSON, gli addebiti arrivati a scadenza vengono registrati da soli.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

  const stats = [
    { label: "Abbonamenti al mese", value: formatEUR(monthlySubs), hint: `≈ ${formatEUR(monthlySubs * 12)} all'anno` },
    { label: "Rate da pagare", value: formatEUR(debt), hint: `${openPlans.length} pian${openPlans.length === 1 ? "o" : "i"} in corso` },
    { label: "Prossimi 30 giorni", value: formatEUR(upcomingTotal), hint: `${upcoming.length} addebit${upcoming.length === 1 ? "o" : "i"}` },
  ];

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Riepilogo */}
      <section className="card animate-rise grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map(({ label, value, hint }) => (
          <div key={label} className="flex items-center justify-between gap-4 px-5 py-4 sm:block sm:px-6 sm:py-6">
            <p className="text-sm font-medium text-subtle">{label}</p>
            <div className="text-right sm:mt-2 sm:text-left">
              <p className="text-xl font-extrabold tracking-tight tabular sm:text-3xl">{value}</p>
              <p className="text-xs text-subtle">{hint}</p>
            </div>
          </div>
        ))}
      </section>

      {/* In arrivo */}
      {upcoming.length > 0 && (
        <section className="animate-rise" style={{ animationDelay: "60ms" }}>
          <SectionHeader title="In arrivo" subtitle="Addebiti previsti nei prossimi 30 giorni" />
          <UpcomingStrip items={upcoming} today={today} />
        </section>
      )}

      {/* Abbonamenti */}
      <section className="animate-rise" style={{ animationDelay: "120ms" }}>
        <SectionHeader
          title="Abbonamenti"
          subtitle={
            subs.length
              ? `${activeSubs.length} attiv${activeSubs.length === 1 ? "o" : "i"}${
                  subs.length > activeSubs.length ? ` · ${subs.length - activeSubs.length} in pausa` : ""
                } · tocca per modificare`
              : "Servizi con addebito periodico"
          }
          action={<AddButton label="Aggiungi" onClick={() => onCreate("subscription")} />}
        />
        {subs.length ? (
          <SubscriptionList rules={subs} statuses={statuses} today={today} onOpen={onOpen} />
        ) : (
          <EmptySection text="Nessun abbonamento registrato." cta="Aggiungi il primo abbonamento" onClick={() => onCreate("subscription")} />
        )}
      </section>

      {/* Pagamenti a rate */}
      <section className="animate-rise" style={{ animationDelay: "180ms" }}>
        <SectionHeader
          title="Pagamenti a rate"
          subtitle={
            plans.length
              ? `${openPlans.length} in corso${completedPlans.length ? ` · ${completedPlans.length} saldat${completedPlans.length === 1 ? "o" : "i"}` : ""}`
              : "PayPal, Klarna, Scalapay e altri"
          }
          action={<AddButton label="Aggiungi" onClick={() => onCreate("installment")} />}
        />
        {openPlans.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {openPlans.map((rule) => (
              <InstallmentCard
                key={rule.id}
                rule={rule}
                status={statuses.get(rule.id)!}
                today={today}
                onOpen={() => onOpen(rule)}
              />
            ))}
          </div>
        ) : (
          <EmptySection
            text={plans.length ? "Nessun piano in corso: tutte le rate sono saldate." : "Nessun pagamento a rate registrato."}
            cta="Aggiungi un pagamento a rate"
            onClick={() => onCreate("installment")}
          />
        )}

        {completedPlans.length > 0 && (
          <div className="mt-5">
            <button
              onClick={() => setShowCompleted((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-semibold text-subtle hover:text-ink"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", showCompleted && "rotate-180")} />
              Piani saldati ({completedPlans.length})
            </button>
            {showCompleted && (
              <div className="card mt-3 divide-y divide-line overflow-hidden animate-in fade-in">
                {completedPlans.map((rule) => (
                  <CompletedInstallment
                    key={rule.id}
                    rule={rule}
                    status={statuses.get(rule.id)!}
                    onOpen={() => onOpen(rule)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
