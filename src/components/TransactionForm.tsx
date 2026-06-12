import type { FC } from "react";
import { useForm } from "react-hook-form";
import type { Transaction, TransactionType, PaymentMethod } from "../types";
import { Button } from "./ui/button";
import {
  Calendar,
  FileText,
  Tag,
  DollarSign,
  ArrowUpDown,
  Check,
  X,
  Save,
  ListPlus,
  Bitcoin,
} from "lucide-react";
import React, { useState } from "react";

interface Props {
  onAdd: (tx: Omit<Transaction, "id">) => void;
  descriptions: string[];
  paymentMethod: PaymentMethod;
  btcPrice: number | null;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-800";

const labelClass =
  "flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300";

export const TransactionForm: FC<Props> = ({
  onAdd,
  descriptions,
  paymentMethod,
  btcPrice,
}) => {
  const [pendingTransactions, setPendingTransactions] = useState<
    Omit<Transaction, "id">[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [amountUnit, setAmountUnit] = useState<"eur" | "sats">("eur");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<
    Omit<Transaction, "id" | "paymentMethod" | "amountSats" | "btcPrice">
  >();

  const currentAmount = watch("amount");

  // Calculate conversion
  const convertedAmount = () => {
    if (paymentMethod !== "bitcoin" || !currentAmount || !btcPrice) return null;

    if (amountUnit === "eur") {
      // EUR to SATS
      const sats = (Number(currentAmount) / btcPrice) * 100000000;
      return sats.toFixed(0);
    } else {
      // SATS to EUR
      const eur = (Number(currentAmount) / 100000000) * btcPrice;
      return eur.toFixed(2);
    }
  };

  // Add transaction to pending list
  const onAddToPending = (
    data: Omit<Transaction, "id" | "paymentMethod" | "amountSats" | "btcPrice">,
  ) => {
    let transaction: Omit<Transaction, "id">;

    if (paymentMethod === "bitcoin" && btcPrice) {
      if (amountUnit === "sats") {
        // Input in sats, calculate EUR
        const amountInEur = (Number(data.amount) / 100000000) * btcPrice;
        transaction = {
          ...data,
          amount: amountInEur,
          amountSats: Number(data.amount),
          btcPrice,
          paymentMethod: "bitcoin",
        };
      } else {
        // Input in EUR, calculate sats
        const amountInSats = (Number(data.amount) / btcPrice) * 100000000;
        transaction = {
          ...data,
          amount: Number(data.amount),
          amountSats: Math.round(amountInSats),
          btcPrice,
          paymentMethod: "bitcoin",
        };
      }
    } else {
      // Credit card transaction
      transaction = {
        ...data,
        amount: Number(data.amount),
        paymentMethod: "creditCard",
      };
    }

    setPendingTransactions((prev) => [...prev, transaction]);
    setSelectedDate(data.date);

    // Reset form but keep date
    reset({
      date: data.date,
      description: "",
      category: "",
      amount: 0,
      type: "" as TransactionType,
    });
  };

  // Remove from pending
  const removePending = (index: number) => {
    setPendingTransactions((prev) => prev.filter((_, i) => i !== index));
  };

  // Save all pending transactions
  const saveAllTransactions = () => {
    pendingTransactions.forEach((tx) => onAdd(tx));
    setPendingTransactions([]);
    setSelectedDate("");
    reset();
  };

  // Clear all
  const clearAll = () => {
    setPendingTransactions([]);
    setSelectedDate("");
    reset();
  };

  const transactionTypeLabels = {
    expense: "Spesa",
    refund: "Rimborso",
    salary: "Stipendio",
    obligation: "Obbligazioni",
  };

  const transactionTypeColors = {
    expense: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10",
    refund:
      "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
    salary: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
    obligation:
      "text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10",
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onAddToPending)} className="space-y-5">
        {/* Date Section */}
        <div className="space-y-2">
          <label className={labelClass}>
            <Calendar className="h-4 w-4 text-indigo-500" />
            Data delle Transazioni
          </label>
          <input
            type="date"
            {...register("date", { required: "La data è obbligatoria" })}
            className={`${inputClass} sm:max-w-xs`}
          />
          {errors.date && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.date.message}
            </p>
          )}
          {selectedDate && (
            <p className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
              <Check className="h-3 w-3" />
              Aggiungi più transazioni per la data{" "}
              {new Date(selectedDate + "T00:00").toLocaleDateString("it-IT")}
            </p>
          )}
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClass}>
              <FileText className="h-4 w-4 text-slate-400" />
              Descrizione
            </label>
            <input
              list="descs"
              placeholder="Es. Spesa supermercato"
              {...register("description", {
                required: "La descrizione è obbligatoria",
              })}
              className={inputClass}
            />
            <datalist id="descs">
              {descriptions.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className={labelClass}>
              <Tag className="h-4 w-4 text-slate-400" />
              Categoria
            </label>
            <select
              {...register("category", {
                required: "La categoria è obbligatoria",
              })}
              className={inputClass}
            >
              <option value="">Seleziona categoria</option>
              {[
                "Trasporti",
                "Casa",
                "Abbigliamento",
                "Intrattenimento",
                "Cibo",
                "Regali",
                "Farmacia",
                "Ricarica",
                "Piano accumulo bitcoin",
                "Altro",
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.category.message}
              </p>
            )}
          </div>
        </div>

        {/* Amount and Type */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClass}>
              {paymentMethod === "bitcoin" ? (
                <Bitcoin className="h-4 w-4 text-orange-500" />
              ) : (
                <DollarSign className="h-4 w-4 text-slate-400" />
              )}
              Importo
            </label>

            {/* Bitcoin: Toggle EUR/SATS */}
            {paymentMethod === "bitcoin" && (
              <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setAmountUnit("eur")}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    amountUnit === "eur"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  € Euro
                </button>
                <button
                  type="button"
                  onClick={() => setAmountUnit("sats")}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    amountUnit === "sats"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  ₿ Satoshi
                </button>
              </div>
            )}

            <input
              type="number"
              inputMode="decimal"
              step={
                paymentMethod === "creditCard"
                  ? "0.01"
                  : amountUnit === "sats"
                    ? "1"
                    : "0.01"
              }
              placeholder={
                paymentMethod === "bitcoin"
                  ? amountUnit === "sats"
                    ? "0 sats"
                    : "0.00 €"
                  : "0.00 €"
              }
              {...register("amount", {
                required: "L'importo è obbligatorio",
                min: {
                  value: 0.01,
                  message: "L'importo deve essere maggiore di 0",
                },
              })}
              className={inputClass}
            />

            {/* Conversion preview for Bitcoin */}
            {paymentMethod === "bitcoin" && currentAmount && btcPrice && (
              <p className="text-xs text-orange-600 dark:text-orange-400">
                ≈{" "}
                {amountUnit === "eur"
                  ? `${convertedAmount()} sats`
                  : `€${convertedAmount()}`}
              </p>
            )}

            {errors.amount && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className={labelClass}>
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
              Tipo
            </label>
            <select
              {...register("type", { required: "Il tipo è obbligatorio" })}
              className={inputClass}
            >
              <option value="">Seleziona tipo</option>
              {(
                [
                  "expense",
                  "refund",
                  "salary",
                  "obligation",
                ] as TransactionType[]
              ).map((t) => (
                <option key={t} value={t}>
                  {transactionTypeLabels[t]}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.type.message}
              </p>
            )}
          </div>
        </div>

        {/* Add Button */}
        <div className="flex justify-stretch sm:justify-end">
          <Button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-white shadow-sm transition-colors hover:bg-indigo-700 sm:w-auto"
          >
            <ListPlus className="h-5 w-5" />
            {pendingTransactions.length > 0
              ? "Aggiungi Altra"
              : "Aggiungi Transazione"}
          </Button>
        </div>
      </form>

      {/* Pending Transactions List */}
      {pendingTransactions.length > 0 && (
        <div className="animate-fade-in rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-500/5 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
              <ListPlus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              In Attesa ({pendingTransactions.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
            >
              <X className="mr-1 h-4 w-4" />
              Cancella Tutto
            </Button>
          </div>

          <div className="mb-4 space-y-2.5">
            {pendingTransactions.map((tx, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 sm:p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        transactionTypeColors[tx.type]
                      }`}
                    >
                      {transactionTypeLabels[tx.type]}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(tx.date + "T00:00").toLocaleDateString("it-IT")}
                    </span>
                  </div>
                  <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {tx.description}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {tx.category} •
                    {tx.paymentMethod === "bitcoin" && tx.amountSats
                      ? ` ${tx.amountSats.toLocaleString()} sats (€${Number(
                          tx.amount,
                        ).toFixed(2)})`
                      : ` €${Number(tx.amount).toFixed(2)}`}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePending(idx)}
                  className="shrink-0 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            onClick={saveAllTransactions}
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <Save className="h-5 w-5" />
            Salva Tutte le Transazioni ({pendingTransactions.length})
          </Button>
        </div>
      )}
    </div>
  );
};
