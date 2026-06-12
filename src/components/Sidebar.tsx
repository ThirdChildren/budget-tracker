import React from "react";
import type { FC } from "react";
import { CreditCard, Bitcoin, TrendingUp, X } from "lucide-react";
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
  btcBalanceSats: number;
}

export const Sidebar: FC<Props> = ({
  selectedPaymentMethod,
  onPaymentMethodChange,
  btcPrice,
  isLoading,
  isOpen,
  onToggle,
  btcBalanceSats,
}) => {
  return (
    <>
      {/* Overlay for when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-full max-w-sm border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto p-5 sm:p-6">
          {/* Header with Close Button */}
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Metodo di Pagamento
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Seleziona come gestire le tue transazioni
              </p>
            </div>
            <button
              onClick={onToggle}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              title="Chiudi pannello"
            >
              <X size={18} />
            </button>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6 space-y-3">
            {/* Credit Card Option */}
            <button
              onClick={() => {
                onPaymentMethodChange("creditCard");
              }}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                selectedPaymentMethod === "creditCard"
                  ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500 dark:border-indigo-400 dark:bg-indigo-500/10 dark:ring-indigo-400"
                  : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    selectedPaymentMethod === "creditCard"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <CreditCard size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Carta di Credito
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Transazioni in Euro (€)
                  </p>
                </div>
                {selectedPaymentMethod === "creditCard" && (
                  <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                )}
              </div>
            </button>

            {/* Bitcoin Option */}
            <button
              onClick={() => {
                onPaymentMethodChange("bitcoin");
              }}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                selectedPaymentMethod === "bitcoin"
                  ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500 dark:border-orange-400 dark:bg-orange-500/10 dark:ring-orange-400"
                  : "border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-orange-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    selectedPaymentMethod === "bitcoin"
                      ? "bg-orange-500 text-white"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <Bitcoin size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Bitcoin
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Transazioni in Satoshi o Euro
                  </p>
                </div>
                {selectedPaymentMethod === "bitcoin" && (
                  <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                )}
              </div>
            </button>
          </div>

          {/* Bitcoin Info Section */}
          {selectedPaymentMethod === "bitcoin" && (
            <div className="animate-fade-in mb-4 rounded-2xl border border-orange-200 bg-orange-50/60 p-4 dark:border-orange-500/30 dark:bg-orange-500/5">
              {/* Bitcoin Price */}
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp
                    className="text-orange-600 dark:text-orange-400"
                    size={18}
                  />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Prezzo Bitcoin
                  </h3>
                </div>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Caricamento...
                    </span>
                  </div>
                ) : btcPrice ? (
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      €
                      {btcPrice.toLocaleString("it-IT", {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      1 BTC = 100,000,000 satoshi
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Errore nel caricamento del prezzo
                  </p>
                )}
              </div>

              {/* Bitcoin Balance */}
              <div className="border-t border-orange-200 pt-4 dark:border-orange-500/30">
                <div className="mb-2 flex items-center gap-2">
                  <Bitcoin
                    className="text-orange-600 dark:text-orange-400"
                    size={18}
                  />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Saldo Totale
                  </h3>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {btcBalanceSats.toLocaleString("it-IT")}
                    <span className="ml-1 text-base font-normal text-slate-500 dark:text-slate-400">
                      sats
                    </span>
                  </p>
                  {btcPrice && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      ≈ €
                      {((btcBalanceSats / 100000000) * btcPrice).toLocaleString(
                        "it-IT",
                        {
                          maximumFractionDigits: 2,
                        },
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <h4 className="mb-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
              💡 Suggerimento
            </h4>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
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
