// src/App.tsx

import React, { useState, useMemo } from "react";
import { v4 as uuid } from "uuid";
import * as Papa from "papaparse";
import { saveAs } from "file-saver";
import {
  Calendar,
  FileDown,
  Upload,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
} from "lucide-react";
import { Button } from "./components/ui/button";

import type { Transaction } from "./types";
import { TransactionForm } from "./components/TransactionForm";
import { CategoryList } from "./components/CategoryList";
import { SpendingByCategoryChart } from "./components/charts/SpendingByCategoryChart";
import { MonthlyTrendsChart } from "./components/charts/MonthlyTrendsChart";

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // default to current month/year (e.g. "2025-05")
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(thisMonth);
  const [showCharts, setShowCharts] = useState(false);

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
  const totalSalary = filtered
    .filter((t) => t.type === "salary")
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalSalary + totalRefund - totalExpense;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title and Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Budget Tracker
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Gestisci le tue finanze personali
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 w-full sm:w-auto">
              {/* Periodo */}
              <div className="flex-1 min-w-[160px]">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Periodo
                </label>
                <div className="relative">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border border-slate-300 dark:border-slate-600 rounded-xl p-3 pr-10 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full"
                  />
                  <Calendar
                    size={20}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Divisore verticale su desktop */}
              <div className="hidden sm:block h-10 w-px bg-slate-200 dark:bg-slate-700 mx-4" />

              {/* Export/Import Button Group */}
              <div className="flex-1 flex flex-col sm:flex-row gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2 shadow-sm">
                <Button
                  variant="outline"
                  onClick={exportJSON}
                  className="flex-1 flex items-center gap-2 min-w-[100px] justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <FileDown size={16} /> JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={exportCSV}
                  className="flex-1 flex items-center gap-2 min-w-[100px] justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <FileDown size={16} /> CSV
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="flex-1 flex items-center gap-2 min-w-[100px] justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <label className="cursor-pointer flex items-center gap-2 w-full justify-center">
                    <Upload size={16} /> Import
                    <input
                      type="file"
                      accept="application/json"
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>

              {/* Divisore per separare il pulsante grafici */}
              <div className="hidden sm:block h-10 w-px bg-slate-200 dark:bg-slate-700 mx-4" />

              {/* View Charts Button migliorato */}
              <Button
                variant={showCharts ? "default" : "outline"}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-md border-2 border-blue-500 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-800 transition-all focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                style={{ minWidth: 160 }}
                onClick={() => setShowCharts((v) => !v)}
                aria-pressed={showCharts}
                title={showCharts ? "Nascondi grafici" : "Visualizza grafici"}
              >
                <BarChart3 className="w-5 h-5" />
                {showCharts ? "Nascondi Grafici" : "Vedi Grafici"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Charts Section */}
      {showCharts && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:gap-6 md:justify-center gap-8">
            <SpendingByCategoryChart transactions={filtered} />
            <MonthlyTrendsChart transactions={transactions} />
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Spese Totali
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  €{totalExpense.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Rimborsi
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  €{totalRefund.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Stipendio
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  €{totalSalary.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Saldo Netto
                </p>
                <p
                  className={`text-2xl font-bold ${
                    netBalance >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  €{netBalance.toFixed(2)}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl ${
                  netBalance >= 0
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                {netBalance >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Aggiungi Transazione
          </h2>
          <TransactionForm onAdd={handleAdd} descriptions={descriptions} />
        </div>

        {/* Category Cards */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Riepilogo per Categoria
          </h2>
          <CategoryList transactions={filtered} />
        </div>
      </main>
    </div>
  );
}
