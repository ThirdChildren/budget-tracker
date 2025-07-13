import type { FC } from "react";
import { useForm } from "react-hook-form";
import type { Transaction, TransactionType } from "../types";
import { Button } from "./ui/button";
import {
  Plus,
  Calendar,
  FileText,
  Tag,
  DollarSign,
  ArrowUpDown,
} from "lucide-react";
import React from "react";

interface Props {
  onAdd: (tx: Omit<Transaction, "id">) => void;
  descriptions: string[];
}

export const TransactionForm: FC<Props> = ({ onAdd, descriptions }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<Transaction, "id">>();

  const onSubmit = (data: Omit<Transaction, "id">) => {
    onAdd(data);
    reset();
  };

  const transactionTypeLabels = {
    expense: "Spesa",
    refund: "Rimborso",
    salary: "Stipendio",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Date and Description Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            <Calendar className="inline w-4 h-4 mr-2" />
            Data
          </label>
          <input
            type="date"
            {...register("date", { required: "La data è obbligatoria" })}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {errors.date && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.date.message}
            </p>
          )}
        </div>

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
      </div>

      {/* Category, Amount and Type Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            <DollarSign className="inline w-4 h-4 mr-2" />
            Importo
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount", {
              required: "L'importo è obbligatorio",
              min: {
                value: 0.01,
                message: "L'importo deve essere maggiore di 0",
              },
            })}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
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
            {(["expense", "refund", "salary"] as TransactionType[]).map((t) => (
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

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Aggiungi Transazione
        </Button>
      </div>
    </form>
  );
};
