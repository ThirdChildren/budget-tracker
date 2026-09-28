// src/App.tsx

import React, { useState, useMemo, useEffect, useCallback, useRef, Suspense, lazy } from "react";
import { v4 as uuid } from "uuid";
import * as Papa from "papaparse";
import { saveAs } from "file-saver";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { Check } from "lucide-react";

import type { Transaction, PaymentMethod, TransactionType } from "./types";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionSheet } from "./components/TransactionSheet";
import { CategoryList } from "./components/CategoryList";
import { TransactionsView } from "./components/TransactionsView";
import { SideNav, BottomNav, type View } from "./components/layout/Navigation";
import { TopBar } from "./components/layout/TopBar";
import { BalanceHero, type MonthPoint } from "./components/dashboard/BalanceHero";
import { StatTiles } from "./components/dashboard/StatTiles";
import { BitcoinCard } from "./components/dashboard/BitcoinCard";
import { RecentTransactions } from "./components/dashboard/RecentTransactions";
import { useTheme } from "./hooks/useTheme";
import { currentMonth, shiftMonth } from "./lib/format";
import { computeTotals } from "./lib/stats";
import { MoneyProvider, toSats } from "./lib/money";

// Lazy load della vista grafici per code-splitting
const AnalyticsView = lazy(() =>
  import("./components/AnalyticsView").then((m) => ({
    default: m.AnalyticsView,
  })),
);

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // default to current month/year (e.g. "2025-05")
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [view, setView] = useState<View>("dashboard");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Payment method and Bitcoin states
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("creditCard");
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [isBtcLoading, setIsBtcLoading] = useState(false);
  const [showInSats, setShowInSats] = useState(false);

  // Toast di conferma
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message });
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const closeSheet = useCallback(() => setIsSheetOpen(false), []);

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
        showToast(`${parsed.length} transazioni importate`);
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
        showToast(`Salvato in Documenti: ${fileName}`);
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
        showToast(`Salvato in Documenti: ${fileName}`);
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

  // transazioni del metodo di pagamento selezionato (tutte le date)
  const byMethod = useMemo(
    () =>
      transactions.filter(
        (t) => !t.paymentMethod || t.paymentMethod === selectedPaymentMethod,
      ),
    [transactions, selectedPaymentMethod],
  );

  // filter by selected month (YYYY-MM) and payment method
  const filtered = useMemo(
    () => byMethod.filter((t) => t.date.startsWith(selectedMonth)),
    [byMethod, selectedMonth],
  );
  const prevMonth = shiftMonth(selectedMonth, -1);
  const inSats = selectedPaymentMethod === "bitcoin" && showInSats;
  // valore nell'unità selezionata (€ o sats) per totali e grafici
  const valueOf = useCallback(
    (t: Transaction) => (inSats ? toSats(t) : t.amount),
    [inSats],
  );
  const totals = useMemo(() => computeTotals(filtered, valueOf), [filtered, valueOf]);
  const prevTotals = useMemo(
    () => computeTotals(byMethod.filter((t) => t.date.startsWith(prevMonth)), valueOf),
    [byMethod, prevMonth, valueOf],
  );

  // saldo degli ultimi 6 mesi per il mini grafico della hero card
  const history = useMemo<MonthPoint[]>(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const month = shiftMonth(selectedMonth, i - 5);
        const t = computeTotals(byMethod.filter((tx) => tx.date.startsWith(month)), valueOf);
        return { month, net: t.net, income: t.income, expense: t.expense };
      }),
    [byMethod, selectedMonth, valueOf],
  );

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

  const goToTransactions = (type: TransactionType | "all" = "all") => {
    setTypeFilter(type);
    setView("transactions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeView = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  };

  const dataActions = {
    onExportJSON: exportJSON,
    onExportCSV: exportCSV,
    onImport: handleUpload,
  };

  return (
    <MoneyProvider value={inSats}>
    <div className="min-h-screen bg-canvas">
      <SideNav
        view={view}
        onViewChange={changeView}
        onAdd={() => setIsSheetOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        transactionCount={filtered.length}
        {...dataActions}
      />

      <div className="lg:pl-64">
        <TopBar
          view={view}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          paymentMethod={selectedPaymentMethod}
          onPaymentMethodChange={setSelectedPaymentMethod}
        />

        <main
          key={`${view}-${selectedPaymentMethod}`}
          className="mx-auto max-w-6xl px-4 pb-32 pt-4 sm:px-6 lg:px-8 lg:pb-12 lg:pt-6"
        >
          {view === "dashboard" && (
            <div className="space-y-4 sm:space-y-6">
              <div
                className={
                  selectedPaymentMethod === "bitcoin"
                    ? "grid gap-4 sm:gap-6 xl:grid-cols-[1fr_22rem]"
                    : undefined
                }
              >
                <BalanceHero
                  month={selectedMonth}
                  totals={totals}
                  prevTotals={prevTotals}
                  history={history}
                  onSelectMonth={setSelectedMonth}
                />
                {selectedPaymentMethod === "bitcoin" && (
                  <BitcoinCard
                    btcPrice={btcPrice}
                    isLoading={isBtcLoading}
                    balanceSats={btcTotalBalanceSats}
                    showInSats={showInSats}
                    onToggleSats={() => setShowInSats((v) => !v)}
                  />
                )}
              </div>

              <StatTiles
                totals={totals}
                prevTotals={prevTotals}
                onSelect={goToTransactions}
              />

              <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <CategoryList transactions={filtered} inSats={inSats} />
                </div>
                <div className="lg:sticky lg:top-32 lg:col-span-2">
                  <RecentTransactions
                    transactions={filtered}
                    showInSats={inSats}
                    onSeeAll={() => goToTransactions()}
                  />
                </div>
              </div>
            </div>
          )}

          {view === "transactions" && (
            <TransactionsView
              transactions={filtered}
              inSats={inSats}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
            />
          )}

          {view === "analytics" && (
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-24">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-ink border-t-transparent" />
                </div>
              }
            >
              <AnalyticsView
                monthTransactions={filtered}
                allTransactions={byMethod}
                selectedMonth={selectedMonth}
                onSelectMonth={setSelectedMonth}
                dark={theme === "dark"}
              />
            </Suspense>
          )}
        </main>
      </div>

      <BottomNav
        view={view}
        onViewChange={changeView}
        onAdd={() => setIsSheetOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        transactionCount={filtered.length}
        {...dataActions}
      />

      <TransactionSheet
        open={isSheetOpen}
        onClose={closeSheet}
        title="Nuova transazione"
        subtitle={
          selectedPaymentMethod === "bitcoin"
            ? "Pagamento in Bitcoin"
            : "Pagamento con carta"
        }
      >
        <TransactionForm
          onAdd={handleAdd}
          onDone={(count) => {
            closeSheet();
            showToast(
              count === 1
                ? "Transazione salvata"
                : `${count} transazioni salvate`,
            );
          }}
          descriptions={descriptions}
          paymentMethod={selectedPaymentMethod}
          btcPrice={btcPrice}
        />
      </TransactionSheet>

      {/* Toast di conferma */}
      {toast && (
        <div
          key={toast.id}
          className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] lg:bottom-8"
        >
          <div className="flex items-center gap-2.5 rounded-full bg-hero py-2.5 pl-2.5 pr-5 text-sm font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 dark:bg-surface-2 dark:text-ink">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-hero">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            {toast.message}
          </div>
        </div>
      )}
    </div>
    </MoneyProvider>
  );
}
