import { useMemo, useState, type FC } from "react";
import { CalendarDays, Check, CreditCard, History, PenLine, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEUR, todayISO } from "@/lib/format";
import {
  FREQUENCIES,
  PROVIDERS,
  installmentAmount,
  occurrenceAmount,
  occurrenceDate,
  pastOccurrences,
} from "@/lib/recurring";
import type { Frequency, RecurringKind, RecurringRule } from "@/types";
import { CategoryPicker } from "../CategoryPicker";

interface Props {
  initial?: RecurringRule; // presente in modifica
  defaultKind?: RecurringKind;
  onSave: (rule: Omit<RecurringRule, "id"> & { id?: string }, registerPast: boolean) => void;
}

const fieldLabel = "mb-2 block text-xs font-bold uppercase tracking-wide text-subtle";
const inputClass =
  "w-full rounded-2xl border border-line bg-surface-2 py-3 pl-10 pr-3 text-sm placeholder:text-subtle focus:border-brand-ink/40 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/30";
const errorText = "mt-1.5 text-xs font-medium text-expense";
const INSTALLMENT_PRESETS = [3, 4, 6, 10, 12];

const formatLongDate = (iso: string) =>
  new Date(iso + "T00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

export const RecurringForm: FC<Props> = ({ initial, defaultKind = "subscription", onSave }) => {
  const [kind, setKind] = useState<RecurringKind>(initial?.kind ?? defaultKind);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [amount, setAmount] = useState(
    initial ? String(initial.kind === "installment" ? initial.totalAmount : initial.amount) : "",
  );
  const [installments, setInstallments] = useState(initial?.installments ?? 3);
  const [provider, setProvider] = useState(initial?.provider ?? "PayPal");
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? "monthly");
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayISO());
  const [registerPast, setRegisterPast] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const isInstallment = kind === "installment";
  const value = Number(amount.replace(",", "."));

  const draft = useMemo<Omit<RecurringRule, "id">>(
    () => ({
      kind,
      description: description.trim(),
      category,
      amount: isInstallment ? installmentAmount(value || 0, installments) : value || 0,
      frequency,
      startDate,
      active: initial?.active ?? true,
      skipBefore: initial?.skipBefore,
      ...(isInstallment ? { installments, totalAmount: value || 0, provider } : {}),
    }),
    [kind, description, category, value, installments, frequency, startDate, provider, isInstallment, initial],
  );

  const today = todayISO();
  const past = initial ? 0 : pastOccurrences({ ...draft, id: "draft" }, today);
  const errors = {
    description: !draft.description && "Aggiungi una descrizione",
    category: !category && "Scegli una categoria",
    amount: !(value > 0) && "Inserisci un importo maggiore di 0",
    installments: isInstallment && !(installments >= 2) && "Almeno 2 rate",
    startDate: !startDate && "Scegli la data del primo addebito",
  };
  const valid = !Object.values(errors).some(Boolean);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!valid) return;
    onSave({ ...draft, id: initial?.id }, registerPast);
  };

  const show = (k: keyof typeof errors) => submitted && errors[k] && <p className={errorText}>{errors[k]}</p>;

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all",
      active ? "border-transparent bg-hero text-white shadow-sm dark:bg-brand dark:text-hero" : "border-line text-ink-soft hover:border-ink/20",
    );

  const lastDate = isInstallment && startDate ? occurrenceDate({ ...draft, id: "" }, installments - 1) : null;
  const lastAmount = isInstallment ? occurrenceAmount({ ...draft, id: "" }, installments - 1) : 0;

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Tipo di ricorrenza (non modificabile dopo la creazione) */}
      {!initial && (
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-1">
          {(
            [
              { id: "subscription", label: "Abbonamento", icon: Repeat },
              { id: "installment", label: "Pagamento a rate", icon: CreditCard },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setKind(id);
                if (id === "installment") setFrequency("monthly");
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all",
                kind === id ? "bg-surface text-ink shadow-sm" : "text-subtle hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Importo */}
      <div className="rounded-3xl bg-surface-2 p-5 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-subtle">
          {isInstallment ? "Importo totale" : "Importo per addebito"}
        </p>
        <div className="mt-1 flex items-baseline justify-center gap-2">
          <span className="text-3xl font-bold text-expense">€</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="0,00"
            autoFocus={!initial}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-auto min-w-[3ch] max-w-[14rem] bg-transparent text-center text-5xl font-extrabold tracking-tight tabular [field-sizing:content] placeholder:text-ink/20 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        {isInstallment && value > 0 && installments >= 2 && (
          <p className="mt-1 text-sm font-semibold text-ink-soft">
            {installments} rate da <span className="text-ink">{formatEUR(draft.amount)}</span>
            {lastAmount !== draft.amount && <> (ultima {formatEUR(lastAmount)})</>}
          </p>
        )}
        {show("amount")}
      </div>

      {/* Rate: numero e provider */}
      {isInstallment && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <span className={fieldLabel}>Numero di rate</span>
            <div className="flex flex-wrap items-center gap-2">
              {INSTALLMENT_PRESETS.map((n) => (
                <button key={n} type="button" onClick={() => setInstallments(n)} className={chip(installments === n)}>
                  {n}
                </button>
              ))}
              <input
                type="number"
                min={2}
                placeholder="Altro"
                value={INSTALLMENT_PRESETS.includes(installments) ? "" : installments || ""}
                onChange={(e) => setInstallments(Math.max(0, Math.floor(Number(e.target.value))))}
                aria-label="Numero di rate personalizzato"
                className={cn(
                  "w-20 rounded-full border px-3 py-1.5 text-center text-xs font-bold placeholder:font-semibold placeholder:text-subtle focus:outline-none focus:ring-4 focus:ring-brand/30",
                  INSTALLMENT_PRESETS.includes(installments)
                    ? "border-line bg-surface-2"
                    : "border-transparent bg-hero text-white dark:bg-brand dark:text-hero",
                )}
              />
            </div>
            {show("installments")}
          </div>
          <div>
            <span className={fieldLabel}>Metodo</span>
            <div className="flex flex-wrap gap-2">
              {PROVIDERS.map((p) => (
                <button key={p} type="button" onClick={() => setProvider(p)} className={chip(provider === p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Frequenza */}
      <div>
        <span className={fieldLabel}>Ricorrenza</span>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(FREQUENCIES) as Frequency[]).map((f) => (
            <button key={f} type="button" onClick={() => setFrequency(f)} className={chip(frequency === f)}>
              {FREQUENCIES[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Categoria */}
      <div>
        <span className={fieldLabel}>Categoria</span>
        <CategoryPicker
          selected={category}
          controlled
          inputProps={{ name: "recurring-category", onChange: (e) => setCategory(e.target.value) }}
        />
        {show("category")}
      </div>

      {/* Descrizione + data */}
      <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
        <div>
          <label className={fieldLabel} htmlFor="rec-description">Descrizione</label>
          <div className="relative">
            <PenLine className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              id="rec-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isInstallment ? "Es. iPhone 16" : "Es. Netflix"}
              autoComplete="off"
              className={inputClass}
            />
          </div>
          {show("description")}
        </div>
        <div>
          <label className={fieldLabel} htmlFor="rec-start">Primo addebito</label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              id="rec-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          {show("startDate")}
        </div>
      </div>

      {/* Riepilogo */}
      {startDate && value > 0 && (
        <div className="rounded-2xl border border-line p-4 text-sm">
          <p className="font-semibold">
            {isInstallment ? (
              <>
                {installments} addebiti {FREQUENCIES[frequency].label.toLowerCase()} dal{" "}
                {formatLongDate(startDate)}
                {lastDate && <> al {formatLongDate(lastDate)}</>}
              </>
            ) : (
              <>
                {formatEUR(value)} ogni {FREQUENCIES[frequency].short} a partire dal {formatLongDate(startDate)}
                <span className="block text-xs font-medium text-subtle">
                  ≈ {formatEUR(value * FREQUENCIES[frequency].perMonth * 12)} all'anno
                </span>
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-subtle">
            Ogni addebito viene registrato automaticamente come spesa quando la sua data arriva.
          </p>

          {past > 0 && (
            <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl bg-surface-2 p-3">
              <input
                type="checkbox"
                checked={registerPast}
                onChange={(e) => setRegisterPast(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--brand-ink)]"
              />
              <span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <History className="h-4 w-4" />
                  Registra anche {past === 1 ? "l'addebito passato" : `i ${past} addebiti passati`}
                </span>
                <span className="text-xs text-subtle">
                  Disattiva se li hai già inseriti a mano: verranno registrati solo quelli da oggi in poi.
                </span>
              </span>
            </label>
          )}
        </div>
      )}

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-hero px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-hero/20 transition-all hover:-translate-y-0.5 active:translate-y-0 dark:bg-brand dark:text-hero"
      >
        <Check className="h-4 w-4" strokeWidth={3} />
        {initial ? "Salva modifiche" : isInstallment ? "Crea piano rate" : "Crea abbonamento"}
      </button>
    </form>
  );
};
