import { useState, useMemo } from "react";
import { v4 as uuid } from "uuid";
import { useForm } from "react-hook-form";
import * as Papa from "papaparse";
import { saveAs } from "file-saver";
import type { Transaction } from "./types";
import { Plus, FileDown, Upload, Calendar } from "lucide-react";
import React from "react";

const categories = [
  "Trasporti",
  "Casa",
  "Abbigliamento",
  "Intrattenimento",
  "Cibo",
  "Regali",
  "Fondo pensione",
  "Piano accumulo bitcoin",
  "Altro",
] as const;

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // imposta di default sul mese/anno attuale (es. "2025-05")
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(thisMonth);

  const { register, handleSubmit, reset } = useForm<Omit<Transaction, "id">>();

  /* ---- CRUD ---- */
  const addTx = handleSubmit((data) => {
    setTransactions((prev) => [
      ...prev,
      { id: uuid(), ...data, amount: +data.amount },
    ]);
    reset();
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as Transaction[];
        setTransactions(parsed);
      } catch {
        alert("File non valido");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset input
  };

  /* ---- Export ---- */
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "transactions.json");
  };
  const exportCSV = () => {
    const blob = new Blob([Papa.unparse(transactions)], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, "transactions.csv");
  };

  /* ---- Derived data ---- */
  const descriptionOptions = useMemo(
    () =>
      Array.from(new Set(transactions.map((t) => t.description.trim()))).filter(
        Boolean
      ),
    [transactions]
  );

  const filtered = useMemo(
    () => transactions.filter((t) => t.date.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  );

  const totalExpense = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const totalRefund = filtered
    .filter((t) => t.type === "refund")
    .reduce((s, t) => s + t.amount, 0);

  /* ---- UI ---- */
  return (
    <div className="min-h-screen bg-slate-100 p-4 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Budget Tracker</h1>
        <div className="flex flex-wrap gap-3">
          <label className="relative inline-flex items-center">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-xl p-2 pr-10"
            />
            <Calendar
              size={18}
              className="absolute right-3 text-slate-400 pointer-events-none"
            />
          </label>
          <button
            onClick={exportJSON}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl shadow bg-green-600 hover:bg-green-700 text-white"
          >
            <FileDown size={18} /> JSON
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl shadow bg-amber-500 hover:bg-amber-600 text-white"
          >
            <FileDown size={18} /> CSV
          </button>
          <label className="flex items-center gap-2 px-4 py-2 rounded-2xl shadow bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
            <Upload size={18} /> Importa
            <input
              type="file"
              accept="application/json"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      </header>

      {/* Form */}
      <form
        onSubmit={addTx}
        className="grid gap-4 md:grid-cols-6 bg-white p-4 rounded-2xl shadow-lg"
      >
        <input
          type="date"
          {...register("date", { required: true })}
          className="md:col-span-1 border rounded-xl p-2"
        />
        <input
          type="text"
          list="desc-suggestions"
          placeholder="Description"
          {...register("description", { required: true })}
          className="md:col-span-2 border rounded-xl p-2"
        />
        <datalist id="desc-suggestions">
          {descriptionOptions.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
        <select
          {...register("category", { required: true })}
          className="md:col-span-1 border rounded-xl p-2"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
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
          <option value="expense">Expense</option>
          <option value="refund">Refund</option>
        </select>
        <button
          type="submit"
          className="md:col-span-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl py-2 mt-2"
        >
          <Plus size={18} /> Add
        </button>
      </form>

      {/* Totali */}
      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-2xl shadow p-4">
          <p className="text-sm text-slate-500">Spesa totale</p>
          <p className="text-2xl font-semibold text-red-600">
            € {totalExpense.toFixed(2)}
          </p>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow p-4">
          <p className="text-sm text-slate-500">Rimborso totale</p>
          <p className="text-2xl font-semibold text-green-600">
            € {totalRefund.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabella transazioni */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full text-left">
          <thead className="bg-slate-200">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Description</th>
              <th className="p-2">Category</th>
              <th className="p-2">Type</th>
              <th className="p-2 text-right">Amount €</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="odd:bg-white even:bg-slate-50">
                <td className="p-2 whitespace-nowrap">{t.date}</td>
                <td className="p-2">{t.description}</td>
                <td className="p-2">{t.category}</td>
                <td className="p-2 capitalize">{t.type}</td>
                <td className="p-2 text-right">{t.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
