import { useRef, type FC } from "react";
import { ChevronLeft, ChevronRight, CreditCard, Bitcoin } from "lucide-react";
import { cn } from "@/lib/utils";
import { currentMonth, formatMonth, shiftMonth } from "@/lib/format";
import type { PaymentMethod } from "@/types";
import { Logo, NAV_ITEMS, type View } from "./Navigation";

interface Props {
  view: View;
  selectedMonth: string;
  onMonthChange: (m: string) => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
}

const SUBTITLES: Record<View, string> = {
  dashboard: "Il tuo mese a colpo d'occhio",
  transactions: "Tutti i movimenti del periodo",
  analytics: "Dove vanno i tuoi soldi",
};

export const MonthSwitcher: FC<{
  value: string;
  onChange: (m: string) => void;
}> = ({ value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isCurrent = value === currentMonth();

  const arrow =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink active:scale-95";

  return (
    <div className="flex flex-1 items-center gap-1 rounded-2xl border border-line bg-surface p-1 sm:flex-none">
      <button onClick={() => onChange(shiftMonth(value, -1))} className={arrow} aria-label="Mese precedente">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="relative flex min-w-0 flex-1 cursor-pointer flex-col items-center px-2 sm:w-36">
        <span className="truncate text-sm font-bold">{formatMonth(value)}</span>
        {!isCurrent && (
          <button
            onClick={() => onChange(currentMonth())}
            className="relative z-10 text-[10px] font-semibold uppercase tracking-wide text-brand-ink hover:underline"
          >
            Torna a oggi
          </button>
        )}
        {/* input nativo sovrapposto: tap sull'etichetta apre il selettore */}
        <input
          ref={inputRef}
          type="month"
          value={value}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          onClick={() => inputRef.current?.showPicker?.()}
          className={cn("absolute inset-0 cursor-pointer opacity-0", !isCurrent && "bottom-4")}
          aria-label="Seleziona mese"
        />
      </div>
      <button onClick={() => onChange(shiftMonth(value, 1))} className={arrow} aria-label="Mese successivo">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export const PaymentToggle: FC<{
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
}> = ({ value, onChange }) => {
  const options = [
    { id: "creditCard" as const, label: "Carta", icon: CreditCard },
    { id: "bitcoin" as const, label: "Bitcoin", icon: Bitcoin },
  ];
  return (
    <div className="relative flex shrink-0 rounded-2xl border border-line bg-surface p-1">
      {/* indicatore scorrevole */}
      <span
        className={cn(
          "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-out",
          value === "bitcoin"
            ? "translate-x-full bg-btc shadow-md shadow-btc/30"
            : "translate-x-0 bg-hero shadow-md dark:bg-surface-2",
        )}
      />
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors sm:px-4",
            value === id ? "text-white dark:text-ink" : "text-subtle hover:text-ink",
            value === id && id === "bitcoin" && "dark:text-white",
          )}
          aria-pressed={value === id}
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

export const TopBar: FC<Props> = ({
  view,
  selectedMonth,
  onMonthChange,
  paymentMethod,
  onPaymentMethodChange,
}) => {
  const title = NAV_ITEMS.find((n) => n.id === view)!.label;

  return (
    <header className="sticky top-0 z-20 border-b border-line/60 bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 lg:py-5">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <Logo compact />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
            <p className="hidden text-sm text-subtle sm:block">{SUBTITLES[view]}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MonthSwitcher value={selectedMonth} onChange={onMonthChange} />
          <PaymentToggle value={paymentMethod} onChange={onPaymentMethodChange} />
        </div>
      </div>
    </header>
  );
};
