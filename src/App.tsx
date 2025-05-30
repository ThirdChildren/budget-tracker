// src/App.tsx

import React, { useState, useMemo } from "react";
import { v4 as uuid } from "uuid";
import * as Papa from "papaparse";
import { saveAs } from "file-saver";
import { Calendar, FileDown, Upload } from "lucide-react";
import { Button } from "./components/ui/button";

import type { Transaction } from "./types";
import { TransactionForm } from "./components/TransactionForm";
import { CategoryList } from "./components/CategoryList";

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // default to current month/year (e.g. "2025-05")
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(thisMonth);

  // add a new transaction
  const handleAdd = (data: Omit<Transaction, "id">) => {
    setTransactions((prev) => [
      ...prev,
      { id: uuid(), ...data, amount: +data.amount },
    ]);
  };

  // import JSON
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
    e.target.value = "";
  };

  // export JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "transactions.json");
  };

  // export CSV
  const exportCSV = () => {
    const blob = new Blob([Papa.unparse(transactions)], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, "transactions.csv");
  };

  // gather all existing description strings for suggestions
  const descriptions = useMemo(
    () =>
      Array.from(new Set(transactions.map((t) => t.description.trim()))).filter(
        Boolean
      ),
    [transactions]
  );

  // filter by selected month (YYYY-MM)
  const filtered = useMemo(
    () => transactions.filter((t) => t.date.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  );

  // calculate totals
  const totalExpense = filtered
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalRefund = filtered
    .filter((t) => t.type === "refund")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-slate-100 p-4 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Budget Tracker</h1>

        <div className="flex flex-wrap items-center gap-3">
          <label className="relative">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-lg p-2 pr-10"
            />
            <Calendar
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </label>

          <Button
            variant="ghost"
            onClick={exportJSON}
            className="flex items-center gap-2"
          >
            <FileDown size={18} /> JSON
          </Button>
          <Button
            variant="ghost"
            onClick={exportCSV}
            className="flex items-center gap-2"
          >
            <FileDown size={18} /> CSV
          </Button>
          <Button variant="ghost" asChild className="flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <Upload size={18} /> Import
              <input
                type="file"
                accept="application/json"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </header>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
          <span className="text-sm text-slate-500">Spesa totale</span>
          <span className="text-2xl font-bold text-red-600">
            €{totalExpense.toFixed(2)}
          </span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
          <span className="text-sm text-slate-500">Rimborso totale</span>
          <span className="text-2xl font-bold text-green-600">
            €{totalRefund.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Transaction Form */}
      <TransactionForm onAdd={handleAdd} descriptions={descriptions} />

      {/* Category Cards */}
      <CategoryList transactions={filtered} />
    </div>
  );
}
