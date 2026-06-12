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
  Landmark,
  CreditCard,
  Bitcoin,
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

const btnSecondary =
  "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100";

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
  const totalObligations = filtered
    .filter((t) => t.type === "obligation")
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance =
    totalSalary + totalRefund + totalObligations - totalExpense;

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
      // For Bitcoin: all income types add sats, expenses subtract sats
      if (t.type === "expense") {
        return sum - (t.amountSats || 0);
      }
      return sum + (t.amountSats || 0);
    }, 0);
    return btcInitialBalanceSats + btcDelta;
  }, [transactions, btcInitialBalanceSats]);

  const summaryCards = [
    {
      label: "Spese Totali",
      value: totalExpense,
      icon: TrendingDown,
      iconClass: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
      valueClass: "text-red-600 dark:text-red-400",
    },
    {
      label: "Rimborsi",
      value: totalRefund,
      icon: TrendingUp,
      iconClass:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
      valueClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Stipendio",
      value: totalSalary,
      icon: Wallet,
      iconClass:
        "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      valueClass: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Obbligazioni",
      value: totalObligations,
      icon: Landmark,
      iconClass:
        "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
      valueClass: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
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

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:py-4">
            {/* Title row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-white sm:text-xl">
                    Budget Tracker
                  </h1>
                  <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                    Gestisci le tue finanze personali
                  </p>
                </div>
              </div>

              {/* Payment method pill (always visible, opens panel) */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={`${btnSecondary} shrink-0`}
                title="Cambia metodo di pagamento"
              >
                {selectedPaymentMethod === "bitcoin" ? (
                  <>
                    <Bitcoin size={16} className="text-orange-500" />
                    <span>Bitcoin</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={16} className="text-indigo-500" />
                    <span>Carta</span>
                  </>
                )}
              </button>
            </div>

            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Month picker */}
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 sm:flex-none">
                <Calendar
                  size={16}
                  className="shrink-0 text-slate-400 dark:text-slate-500"
                />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm font-medium text-slate-900 focus:outline-none dark:text-slate-100"
                />
              </div>

              <button
                onClick={exportJSON}
                className={btnSecondary}
                title="Esporta JSON"
              >
                <FileDown size={16} />
                <span>JSON</span>
              </button>
              <button
                onClick={exportCSV}
                className={btnSecondary}
                title="Esporta CSV"
              >
                <FileDown size={16} />
                <span>CSV</span>
              </button>
              <label className={`${btnSecondary} cursor-pointer`} title="Importa file">
                <Upload size={16} />
                <span>Import</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setShowCharts((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium shadow-sm transition-colors ${
                  showCharts
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
                title={showCharts ? "Nascondi grafici" : "Visualizza grafici"}
              >
                <BarChart3 size={16} />
                <span>{showCharts ? "Nascondi" : "Grafici"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Charts Section */}
        {showCharts && (
          <section className="animate-fade-in">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                </div>
              }
            >
              {/* flex-wrap: i grafici sono ridimensionabili col mouse su desktop */}
              <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-start">
                <SpendingByCategoryChart transactions={filtered} />
                <MonthlyTrendsChart
                  transactions={transactions}
                  paymentMethod={selectedPaymentMethod}
                />
              </div>
            </Suspense>
          </section>
        )}

        {/* Summary Cards */}
        <div className="grid animate-slide-up grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
          {summaryCards.map(({ label, value, icon: Icon, iconClass, valueClass }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
                    {label}
                  </p>
                  <p
                    className={`mt-1 truncate text-lg font-bold sm:text-2xl ${valueClass}`}
                  >
                    €{value.toFixed(2)}
                  </p>
                </div>
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${iconClass}`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </div>
          ))}

          {/* Net balance */}
          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-5 xl:col-span-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
                  Saldo Netto
                </p>
                <p
                  className={`mt-1 truncate text-lg font-bold sm:text-2xl ${
                    netBalance >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  €{netBalance.toFixed(2)}
                </p>
              </div>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${
                  netBalance >= 0
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                }`}
              >
                {netBalance >= 0 ? (
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Form */}
        <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h2 className="mb-5 flex items-center gap-2.5 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Plus className="h-4 w-4" />
            </span>
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
          <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <BarChart3 className="h-4 w-4" />
            </span>
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
  );
}
