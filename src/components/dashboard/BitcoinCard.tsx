import type { FC } from "react";
import { Bitcoin, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEUR } from "@/lib/format";

interface Props {
  btcPrice: number | null;
  isLoading: boolean;
  balanceSats: number;
  showInSats: boolean;
  onToggleSats: () => void;
}

export const BitcoinCard: FC<Props> = ({
  btcPrice,
  isLoading,
  balanceSats,
  showInSats,
  onToggleSats,
}) => (
  <section className="animate-rise relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#f7931a] to-[#e2610f] p-6 text-white shadow-xl shadow-btc/20">
    <Bitcoin className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rotate-12 text-white/10" />

    <div className="relative flex items-center justify-between">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
        <Bitcoin className="h-3.5 w-3.5" /> Wallet Bitcoin
      </span>
      {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-white/70" />}
    </div>

    <p className="relative mt-5 text-xs font-medium text-white/70">Saldo totale</p>
    <p className="relative mt-0.5 text-3xl font-extrabold tracking-tight tabular">
      {balanceSats.toLocaleString("it-IT")}
      <span className="ml-1.5 text-base font-semibold text-white/70">sats</span>
    </p>
    {btcPrice && (
      <p className="relative text-sm font-medium text-white/80 tabular">
        ≈ {formatEUR((balanceSats / 1e8) * btcPrice)}
      </p>
    )}

    <div className="relative mt-5 flex items-center justify-between gap-3 rounded-2xl bg-black/15 p-3 backdrop-blur">
      <div>
        <p className="text-[11px] font-medium text-white/70">Prezzo BTC</p>
        <p className="text-sm font-bold tabular">
          {btcPrice ? formatEUR(btcPrice) : isLoading ? "Caricamento…" : "Non disponibile"}
        </p>
      </div>
      <button
        onClick={onToggleSats}
        role="switch"
        aria-checked={showInSats}
        className="flex items-center gap-2 text-xs font-semibold"
      >
        Mostra in sats
        <span
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            showInSats ? "bg-white" : "bg-white/25",
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-4 w-4 rounded-full transition-all",
              showInSats ? "left-6 bg-btc" : "left-1 bg-white",
            )}
          />
        </span>
      </button>
    </div>
  </section>
);
