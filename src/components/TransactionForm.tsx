import { useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { AlertTriangle, CalendarDays, Check, ListPlus, PenLine, X } from "lucide-react";
import type { Transaction, PaymentMethod } from "../types";
import { cn } from "@/lib/utils";
import { getCategory, tint, TYPES, TYPE_ORDER } from "@/lib/config";
import { CategoryPicker } from "./CategoryPicker";
import { formatEUR, formatSats, formatShortDate, todayISO } from "@/lib/format";

interface Props {
  onAdd: (tx: Omit<Transaction, "id">) => void;
  onDone: (count: number) => void;
  descriptions: string[];
  paymentMethod: PaymentMethod;
  btcPrice: number | null;
}

type FormValues = Omit<Transaction, "id" | "paymentMethod" | "amountSats" | "btcPrice">;

const fieldLabel = "mb-2 block text-xs font-bold uppercase tracking-wide text-subtle";
const errorText = "mt-1.5 text-xs font-medium text-expense";

export const TransactionForm: FC<Props> = ({
  onAdd,
  onDone,
  descriptions,
  paymentMethod,
  btcPrice,
}) => {
  const [pending, setPending] = useState<Omit<Transaction, "id">[]>([]);
  const [amountUnit, setAmountUnit] = useState<"eur" | "sats">("eur");
  const isBtc = paymentMethod === "bitcoin";
  const btcUnavailable = isBtc && !btcPrice;

  const defaults = { date: todayISO(), type: "expense" as const, description: "", category: "" };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: defaults });

  const [amount, type, category, description, date] = watch([
    "amount",
    "type",
    "category",
    "description",
    "date",
  ]);

  // Anteprima conversione EUR <-> sats
  const converted =
    isBtc && amount && btcPrice
      ? amountUnit === "eur"
        ? formatSats((Number(amount) / btcPrice) * 1e8)
        : formatEUR((Number(amount) / 1e8) * btcPrice)
      : null;

  const build = (data: FormValues): Omit<Transaction, "id"> => {
    if (isBtc && btcPrice) {
      if (amountUnit === "sats") {
        return {
          ...data,
          amount: (Number(data.amount) / 1e8) * btcPrice,
          amountSats: Number(data.amount),
          btcPrice,
          paymentMethod: "bitcoin",
        };
      }
      return {
        ...data,
        amount: Number(data.amount),
        amountSats: Math.round((Number(data.amount) / btcPrice) * 1e8),
        btcPrice,
        paymentMethod: "bitcoin",
      };
    }
    return { ...data, amount: Number(data.amount), paymentMethod: "creditCard" };
  };

  // Svuota i campi ma mantiene data e tipo per inserimenti in serie
  const resetKeeping = (data: Pick<FormValues, "date" | "type">) =>
    reset({ ...defaults, date: data.date, type: data.type, amount: undefined });

  const addToPending = handleSubmit((data) => {
    setPending((prev) => [...prev, build(data)]);
    resetKeeping(data);
  });

  const commit = (list: Omit<Transaction, "id">[]) => {
    list.forEach((tx) => onAdd(tx));
    setPending([]);
    reset({ ...defaults, amount: undefined });
    onDone(list.length);
  };

  const formEmpty = !description && !amount && !category;
  const saveCount = pending.length + (formEmpty && pending.length > 0 ? 0 : 1);
  const save = () => {
    if (pending.length > 0 && formEmpty) commit(pending);
    else handleSubmit((data) => commit([...pending, build(data)]))();
  };

  const typeCfg = TYPES[type] ?? TYPES.expense;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-6"
    >
      {/* Tipo */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TYPE_ORDER.map((t) => {
          const cfg = TYPES[t];
          const Icon = cfg.icon;
          const active = type === t;
          return (
            <label
              key={t}
              className={cn(
                "flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border px-2 py-2.5 text-xs font-bold transition-all",
                active ? cn(cfg.solid, "border-transparent shadow-md") : "border-line bg-surface text-ink-soft hover:border-ink/20",
              )}
            >
              <input type="radio" value={t} className="sr-only" {...register("type", { required: true })} />
              <Icon className={cn("h-4 w-4", !active && cfg.text)} />
              {cfg.label}
            </label>
          );
        })}
      </div>

      {/* Importo */}
      <div className="rounded-3xl bg-surface-2 p-5 text-center">
        {isBtc && (
          <div className="mx-auto mb-3 flex w-fit rounded-full bg-surface p-1 text-xs font-bold shadow-sm">
            {(["eur", "sats"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setAmountUnit(u)}
                className={cn(
                  "rounded-full px-4 py-1.5 transition-colors",
                  amountUnit === u ? "bg-btc text-white" : "text-subtle hover:text-ink",
                )}
              >
                {u === "eur" ? "€ Euro" : "₿ Satoshi"}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-baseline justify-center gap-2">
          <span className={cn("text-3xl font-bold", typeCfg.text)}>
            {typeCfg.sign}
            {isBtc && amountUnit === "sats" ? "" : "€"}
          </span>
          <input
            type="number"
            inputMode="decimal"
            step={isBtc && amountUnit === "sats" ? "1" : "0.01"}
            placeholder="0,00"
            autoFocus
            {...register("amount", {
              required: "Inserisci un importo",
              min: { value: 0.01, message: "L'importo deve essere maggiore di 0" },
            })}
            className="w-auto min-w-[3ch] max-w-[14rem] bg-transparent text-center text-5xl [field-sizing:content] font-extrabold tracking-tight tabular placeholder:text-ink/20 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {isBtc && amountUnit === "sats" && <span className="text-lg font-bold text-subtle">sats</span>}
        </div>
        {converted && <p className="mt-1 text-sm font-semibold text-btc">≈ {converted}</p>}
        {errors.amount && <p className={errorText}>{errors.amount.message}</p>}
      </div>

      {/* Categoria */}
      <div>
        <span className={fieldLabel}>Categoria</span>
        <CategoryPicker
          selected={category}
          inputProps={register("category", { required: "Scegli una categoria" })}
        />
        {errors.category && <p className={errorText}>{errors.category.message}</p>}
      </div>

      {/* Descrizione + data */}
      <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
        <div>
          <label className={fieldLabel} htmlFor="tx-description">Descrizione</label>
          <div className="relative">
            <PenLine className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              id="tx-description"
              list="descs"
              placeholder="Es. Spesa supermercato"
              autoComplete="off"
              {...register("description", { required: "Aggiungi una descrizione" })}
              className="w-full rounded-2xl border border-line bg-surface-2 py-3 pl-10 pr-3 text-sm placeholder:text-subtle focus:border-brand-ink/40 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/30"
            />
          </div>
          <datalist id="descs">
            {descriptions.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
          {errors.description && <p className={errorText}>{errors.description.message}</p>}
        </div>
        <div>
          <label className={fieldLabel} htmlFor="tx-date">Data</label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              id="tx-date"
              type="date"
              {...register("date", { required: "Scegli una data" })}
              className="w-full rounded-2xl border border-line bg-surface-2 py-3 pl-10 pr-3 text-sm focus:border-brand-ink/40 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/30"
            />
          </div>
          {errors.date && <p className={errorText}>{errors.date.message}</p>}
        </div>
      </div>

      {/* In attesa di salvataggio */}
      {pending.length > 0 && (
        <div className="animate-rise rounded-3xl border border-dashed border-line p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-bold uppercase tracking-wide text-subtle">
              In coda · {pending.length}
            </p>
            <button
              type="button"
              onClick={() => setPending([])}
              className="text-xs font-semibold text-subtle hover:text-expense"
            >
              Svuota
            </button>
          </div>
          <ul className="space-y-1.5">
            {pending.map((tx, idx) => {
              const cat = getCategory(tx.category);
              const Icon = cat.icon;
              return (
                <li key={idx} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3 py-2">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: tint(cat.color), color: cat.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{tx.description}</p>
                    <p className="text-[11px] text-subtle">
                      {TYPES[tx.type].label} · {formatShortDate(tx.date)}
                    </p>
                  </div>
                  <span className={cn("text-sm font-bold tabular", TYPES[tx.type].text)}>
                    {TYPES[tx.type].sign}
                    {tx.amountSats ? formatSats(tx.amountSats) : formatEUR(tx.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPending((p) => p.filter((_, i) => i !== idx))}
                    className="rounded-full p-1 text-subtle hover:bg-expense/10 hover:text-expense"
                    aria-label="Rimuovi"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {btcUnavailable && (
        <p className="flex items-center gap-2 rounded-2xl bg-btc/10 px-4 py-3 text-sm font-medium text-btc">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Prezzo Bitcoin non disponibile: impossibile convertire l'importo.
        </p>
      )}

      {/* Azioni */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button
          type="button"
          onClick={addToPending}
          disabled={btcUnavailable}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-line px-4 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-surface-2 disabled:opacity-40"
        >
          <ListPlus className="h-4 w-4" />
          Aggiungi e continua
        </button>
        <button
          type="submit"
          disabled={btcUnavailable}
          className="flex flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-hero px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-hero/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 dark:bg-brand dark:text-hero"
        >
          <Check className="h-4 w-4" strokeWidth={3} />
          {saveCount > 1 ? `Salva ${saveCount} transazioni` : "Salva transazione"}
        </button>
      </div>
      {date && pending.length > 0 && (
        <p className="-mt-3 text-center text-[11px] text-subtle">
          Data e tipo restano impostati per inserire più movimenti di fila
        </p>
      )}
    </form>
  );
};
