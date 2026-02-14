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
  };

  const transactionTypeColors = {
    expense: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
    refund:
      "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
    salary: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onAddToPending)} className="space-y-6">
        {/* Date Section - More prominent */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <Calendar className="inline w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Data delle Transazioni
          </label>
          <input
            type="date"
            {...register("date", { required: "La data è obbligatoria" })}
            className="w-full border-2 border-blue-300 dark:border-blue-600 rounded-xl p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
          />
          {errors.date && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.date.message}
            </p>
          )}
          {selectedDate && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Aggiungi più transazioni per la data{" "}
              {new Date(selectedDate + "T00:00").toLocaleDateString("it-IT")}
            </p>
          )}
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              <FileText className="inline w-4 h-4 mr-2" />
              Descrizione
            </label>
            <input
              list="descs"
              placeholder="Es. Spesa supermercato"
              {...register("description", {
                required: "La descrizione è obbligatoria",
              })}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              <Tag className="inline w-4 h-4 mr-2" />
              Categoria
            </label>
            <select
              {...register("category", {
                required: "La categoria è obbligatoria",
              })}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {paymentMethod === "bitcoin" ? (
                <Bitcoin className="inline w-4 h-4 mr-2" />
              ) : (
                <DollarSign className="inline w-4 h-4 mr-2" />
              )}
              Importo
            </label>

            {/* Bitcoin: Toggle EUR/SATS */}
            {paymentMethod === "bitcoin" && (
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setAmountUnit("eur")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    amountUnit === "eur"
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  € Euro
                </button>
                <button
                  type="button"
                  onClick={() => setAmountUnit("sats")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    amountUnit === "sats"
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  ₿ Satoshi
                </button>
              </div>
            )}

            <input
              type="number"
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
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />

            {/* Conversion preview for Bitcoin */}
            {paymentMethod === "bitcoin" && currentAmount && btcPrice && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              <ArrowUpDown className="inline w-4 h-4 mr-2" />
              Tipo
            </label>
            <select
              {...register("type", { required: "Il tipo è obbligatorio" })}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Seleziona tipo</option>
              {(["expense", "refund", "salary"] as TransactionType[]).map(
                (t) => (
                  <option key={t} value={t}>
                    {transactionTypeLabels[t]}
                  </option>
                ),
              )}
            </select>
            {errors.type && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.type.message}
              </p>
            )}
          </div>
        </div>

        {/* Add Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ListPlus className="w-5 h-5" />
            {pendingTransactions.length > 0
              ? "Aggiungi Altra"
              : "Aggiungi Transazione"}
          </Button>
        </div>
      </form>

      {/* Pending Transactions List */}
      {pendingTransactions.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-amber-200 dark:border-amber-800 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ListPlus className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Transazioni in Attesa ({pendingTransactions.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <X className="w-4 h-4 mr-1" />
              Cancella Tutto
            </Button>
          </div>

          <div className="space-y-3 mb-4">
            {pendingTransactions.map((tx, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        transactionTypeColors[tx.type]
                      }`}
                    >
                      {transactionTypeLabels[tx.type]}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">
                      {new Date(tx.date + "T00:00").toLocaleDateString("it-IT")}
                    </span>
                  </div>
                  <div className="text-slate-900 dark:text-slate-100 font-medium">
                    {tx.description}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
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
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ml-4"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            onClick={saveAllTransactions}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            <Save className="w-5 h-5" />
            Salva Tutte le Transazioni ({pendingTransactions.length})
          </Button>
        </div>
      )}
    </div>
  );
};
