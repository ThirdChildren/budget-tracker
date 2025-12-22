import React from "react";
import type { FC } from "react";
import { CreditCard, Bitcoin, TrendingUp, Eye, Menu, X } from "lucide-react";
import type { PaymentMethod } from "../types";

interface Props {
  selectedPaymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  btcPrice: number | null;
  isLoading: boolean;
  showInSats: boolean;
  onToggleSatsView: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: FC<Props> = ({
  selectedPaymentMethod,
  onPaymentMethodChange,
  btcPrice,
  isLoading,
  showInSats,
  onToggleSatsView,
  isOpen,
  onToggle,
}) => {
  return (
    <>
      {/* Toggle Button - Shown only when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl rounded-full p-4 hover:scale-110 transition-all duration-300 group"
          title="Apri metodi di pagamento"
        >
          <Menu size={24} />
          <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Metodo Pagamento
          </span>
        </button>
      )}

      {/* Overlay for when sidebar is open */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onToggle} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-xl z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-80`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Header with Close Button */}
          <div className="mb-8 relative">
            {/* Close Button */}
            <button
              onClick={onToggle}
              className="absolute -top-2 -right-2 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all hover:scale-110"
              title="Chiudi sidebar"
            >
              <X size={20} className="text-slate-600 dark:text-slate-400" />
            </button>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 pr-8">
              Metodo di Pagamento
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Seleziona come gestire le tue transazioni
            </p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4 mb-8">
            {/* Credit Card Option */}
            <button
              onClick={() => {
                onPaymentMethodChange("creditCard");
                onToggle();
              }}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedPaymentMethod === "creditCard"
                  ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-lg"
                  : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    selectedPaymentMethod === "creditCard"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <CreditCard size={24} />
                </div>
                <div className="text-left flex-1">
                  <h3
                    className={`font-semibold ${
                      selectedPaymentMethod === "creditCard"
                        ? "text-blue-900 dark:text-blue-100"
                        : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    Carta di Credito
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Transazioni in Euro (€)
                  </p>
                </div>
                {selectedPaymentMethod === "creditCard" && (
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                )}
              </div>
            </button>

            {/* Bitcoin Option */}
            <button
              onClick={() => {
                onPaymentMethodChange("bitcoin");
                onToggle();
              }}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedPaymentMethod === "bitcoin"
                  ? "border-orange-500 bg-gradient-to-r from-orange-50 to-amber-100 dark:from-orange-900/30 dark:to-amber-800/30 shadow-lg"
                  : "border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    selectedPaymentMethod === "bitcoin"
                      ? "bg-orange-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Bitcoin size={24} />
                </div>
                <div className="text-left flex-1">
                  <h3
                    className={`font-semibold ${
                      selectedPaymentMethod === "bitcoin"
                        ? "text-orange-900 dark:text-orange-100"
                        : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    Bitcoin
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Transazioni in Satoshi o Euro
                  </p>
                </div>
                {selectedPaymentMethod === "bitcoin" && (
                  <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                )}
              </div>
            </button>
          </div>

          {/* Bitcoin Info Section */}
          {selectedPaymentMethod === "bitcoin" && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border-2 border-orange-200 dark:border-orange-800 animate-fade-in mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp
                  className="text-orange-600 dark:text-orange-400"
                  size={20}
                />
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                  Prezzo Bitcoin
                </h3>
              </div>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Caricamento...
                  </span>
                </div>
              ) : btcPrice ? (
                <div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    €
                    {btcPrice.toLocaleString("it-IT", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    1 BTC = 100,000,000 satoshi
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Errore nel caricamento del prezzo
                </p>
              )}

              {/* Toggle View in Sats/EUR */}
              <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-800">
                <button
                  onClick={onToggleSatsView}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Eye
                      size={16}
                      className="text-orange-600 dark:text-orange-400"
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Visualizza in
                    </span>
                  </div>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {showInSats ? "Satoshi" : "Euro"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-auto bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
              💡 Suggerimento
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {selectedPaymentMethod === "creditCard"
                ? "Con la carta di credito gestisci tutte le tue transazioni in Euro."
                : "Con Bitcoin puoi inserire importi in satoshi o euro. Il valore viene salvato in entrambi i formati per tracking preciso."}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
