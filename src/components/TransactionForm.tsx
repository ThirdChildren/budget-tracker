import type { FC } from "react";
import { useForm } from "react-hook-form";
import type { Transaction, TransactionType } from "../types";
import { Button } from "./ui/button";
import React from "react";

interface Props {
  onAdd: (tx: Omit<Transaction, "id">) => void;
  descriptions: string[];
}

export const TransactionForm: FC<Props> = ({ onAdd, descriptions }) => {
  const { register, handleSubmit, reset } = useForm<Omit<Transaction, "id">>();
  const onSubmit = (data: Omit<Transaction, "id">) => {
    onAdd(data);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4 md:grid-cols-6 bg-white p-4 rounded-2xl shadow-lg"
    >
      <input
        type="date"
        {...register("date", { required: true })}
        className="md:col-span-1 border rounded-xl p-2"
      />
      <input
        list="descs"
        placeholder="Description"
        {...register("description", { required: true })}
        className="md:col-span-2 border rounded-xl p-2"
      />
      <datalist id="descs">
        {descriptions.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>
      <select
        {...register("category", { required: true })}
        className="md:col-span-1 border rounded-xl p-2"
      >
        {[
          "Trasporti",
          "Casa",
          "Abbigliamento",
          "Intrattenimento",
          "Cibo",
          "Regali",
          "Altro",
        ].map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <input
        type="number"
        step="0.01"
        placeholder="Amount"
        {...register("amount", { required: true })}
        className="md:col-span-1 border rounded-xl p-2"
      />
      <select
        {...register("type", { required: true })}
        className="md:col-span-1 border rounded-xl p-2"
      >
        {(["expense", "refund", "salary"] as TransactionType[]).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <Button type="submit" className="md:col-span-6">
        Add Transaction
      </Button>
    </form>
  );
};
