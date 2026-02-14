// src/App.tsx

import React, { useState, useMemo, useEffect, Suspense, lazy } from "react";
import { v4 as uuid } from "uuid";
import * as Papa from "papaparse";
import { saveAs } from "file-saver";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import {
  Calendar,
  FileDown,
  Upload,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  Plus,
} from "lucide-react";

import type { Transaction, PaymentMethod } from "./types";
import { TransactionForm } from "./components/TransactionForm";
import { CategoryList } from "./components/CategoryList";
import { Sidebar } from "./components/Sidebar";

// Lazy load dei grafici per code-splitting
const SpendingByCategoryChart = lazy(() =>
  import("./components/charts/SpendingByCategoryChart").then((m) => ({
    default: m.SpendingByCategoryChart,
  })),
);
const MonthlyTrendsChart = lazy(() =>
  import("./components/charts/MonthlyTrendsChart").then((m) => ({
    default: m.MonthlyTrendsChart,
  })),
);

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // default to current month/year (e.g. "2025-05")
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(thisMonth);
  const [showCharts, setShowCharts] = useState(false);

  // Payment method and Bitcoin states
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("creditCard");
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [isBtcLoading, setIsBtcLoading] = useState(false);
  const [showInSats, setShowInSats] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch Bitcoin price from CoinGecko API
  useEffect(() => {
    const fetchBtcPrice = async () => {
      setIsBtcLoading(true);
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur",
        );
        const data = await response.json();
        setBtcPrice(data.bitcoin.eur);
      } catch (error) {
        console.error("Error fetching BTC price:", error);
        setBtcPrice(null);
      } finally {
        setIsBtcLoading(false);
      }
    };

    fetchBtcPrice();
    // Refresh price every 5 minutes
    const interval = setInterval(fetchBtcPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
  const exportJSON = async () => {
    const content = JSON.stringify(transactions, null, 2);
    const fileName = `transactions_${
      new Date().toISOString().split("T")[0]
    }.json`;

    // Check if running on native platform (mobile)
    if (Capacitor.isNativePlatform()) {
      try {
        // Request permissions first
        const permissions = await Filesystem.checkPermissions();
        if (permissions.publicStorage !== "granted") {
          const request = await Filesystem.requestPermissions();
          if (request.publicStorage !== "granted") {
            alert("Permessi necessari per salvare il file");
            return;
          }
        }

        await Filesystem.writeFile({
          path: fileName,
          data: content,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        alert(`File salvato:\n${fileName}\n\nTrovalo in Documenti`);
      } catch (error) {
        console.error("Errore salvataggio file:", error);
        alert(`Errore: ${error}`);
      }
    } else {
      // Browser - use file-saver
      const blob = new Blob([content], {
        type: "application/json",
      });
      saveAs(blob, fileName);
    }
  };

  // export CSV
  const exportCSV = async () => {
    const content = Papa.unparse(transactions);
    const fileName = `transactions_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    // Check if running on native platform (mobile)
    if (Capacitor.isNativePlatform()) {
      try {
        // Request permissions first
        const permissions = await Filesystem.checkPermissions();
        if (permissions.publicStorage !== "granted") {
          const request = await Filesystem.requestPermissions();
          if (request.publicStorage !== "granted") {
            alert("Permessi necessari per salvare il file");
            return;
          }
        }

        await Filesystem.writeFile({
          path: fileName,
          data: content,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        alert(`File salvato:\n${fileName}\n\nTrovalo in Documenti`);
      } catch (error) {
        console.error("Errore salvataggio file:", error);
        alert(`Errore: ${error}`);
      }
    } else {
      // Browser - use file-saver
      const blob = new Blob([content], {
        type: "text/csv;charset=utf-8;",
      });
      saveAs(blob, fileName);
    }
  };

  // gather all existing description strings for suggestions
  const descriptions = useMemo(
    () =>
      Array.from(new Set(transactions.map((t) => t.description.trim()))).filter(
        Boolean,
      ),
    [transactions],
  );

  // filter by selected month (YYYY-MM) and payment method
  const filtered = useMemo(
    () =>
      transactions
        .filter((t) => t.date.startsWith(selectedMonth))
        .filter(
          (t) => !t.paymentMethod || t.paymentMethod === selectedPaymentMethod,
        ),
    [transactions, selectedMonth, selectedPaymentMethod],
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

  // Calculate Bitcoin total balance (all-time, not just current month)
  const btcInitialBalanceSats = parseInt(
    import.meta.env.VITE_BTC_INITIAL_BALANCE_SATS || "0",
    10,
  );
  const btcTotalBalanceSats = useMemo(() => {
    const btcTransactions = transactions.filter(
      (t) => t.paymentMethod === "bitcoin" && t.amountSats !== undefined,
    );
    const btcDelta = btcTransactions.reduce((sum, t) => {
      // For Bitcoin: salary/refund add sats, expenses subtract sats
      if (t.type === "salary" || t.type === "refund") {
        return sum + (t.amountSats || 0);
      } else {
        return sum - (t.amountSats || 0);
      }
    }, 0);
    return btcInitialBalanceSats + btcDelta;
  }, [transactions, btcInitialBalanceSats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex">
      {/* Sidebar */}
      <Sidebar
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={setSelectedPaymentMethod}
        btcPrice={btcPrice}
        isLoading={isBtcLoading}
        showInSats={showInSats}
        onToggleSatsView={() => setShowInSats(!showInSats)}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        btcBalanceSats={btcTotalBalanceSats}
      />

      {/* Main Content */}
      <div className="flex-1 transition-all duration-300">
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
              <div className="flex flex-wrap items-center gap-3">
                {/* Periodo - Design compatto */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                  <div className="relative flex items-center gap-2 bg-white dark:bg-slate-800 rounded-2xl px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all">
                    <Calendar
                      size={18}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Export/Import Buttons - Design moderno */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportJSON}
                    className="group relative px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    title="Esporta JSON"
                  >
                    <FileDown size={16} />
                    <span>JSON</span>
                  </button>
                  <button
                    onClick={exportCSV}
                    className="group relative px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    title="Esporta CSV"
                  >
                    <FileDown size={16} />
                    <span>CSV</span>
                  </button>
                  <label
                    className="group relative px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 cursor-pointer"
                    title="Importa file"
                  >
                    <Upload size={16} />
                    <span>Import</span>
                    <input
                      type="file"
                      accept="application/json"
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* View Charts Button - Design aggiornato */}
                <button
                  onClick={() => setShowCharts((v) => !v)}
                  className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                    showCharts
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                      : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-pink-400 dark:hover:border-pink-500 text-slate-900 dark:text-slate-100"
                  }`}
                  title={showCharts ? "Nascondi grafici" : "Visualizza grafici"}
                >
                  <BarChart3 size={18} />
                  <span className="hidden md:inline">
                    {showCharts ? "Nascondi" : "Grafici"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Charts Section */}
        {showCharts && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              }
            >
              <div className="flex flex-col md:flex-row md:gap-6 md:justify-center gap-8">
                <SpendingByCategoryChart transactions={filtered} />
                <MonthlyTrendsChart
                  transactions={transactions}
                  paymentMethod={selectedPaymentMethod}
                />
              </div>
            </Suspense>
          </section>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Spese Totali
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                    €{totalExpense.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-xl">
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Rimborsi
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    €{totalRefund.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Stipendio
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    €{totalSalary.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl">
                  <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Saldo Netto
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
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
                      ? "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30"
                      : "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30"
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
          <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl shadow-lg border-2 border-blue-100 dark:border-slate-700 p-8 animate-fade-in">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
                <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              Aggiungi Transazioni
            </h2>
            <TransactionForm
              onAdd={handleAdd}
              descriptions={descriptions}
              paymentMethod={selectedPaymentMethod}
              btcPrice={btcPrice}
            />
          </div>

          {/* Category Cards */}
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              Riepilogo per Categoria
            </h2>
            <CategoryList
              transactions={filtered}
              showInSats={showInSats}
              paymentMethod={selectedPaymentMethod}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
