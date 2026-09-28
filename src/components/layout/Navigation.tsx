import { useState, type FC } from "react";
import {
  LayoutDashboard,
  ListOrdered,
  PieChart,
  Plus,
  Moon,
  Sun,
  FileDown,
  Upload,
  Wallet,
  MoreHorizontal,
  Repeat,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Theme } from "@/hooks/useTheme";

export type View = "dashboard" | "transactions" | "recurring" | "analytics";

export const NAV_ITEMS: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Panoramica", icon: LayoutDashboard },
  { id: "transactions", label: "Movimenti", icon: ListOrdered },
  { id: "recurring", label: "Ricorrenti", icon: Repeat },
  { id: "analytics", label: "Analisi", icon: PieChart },
];

export interface DataActions {
  onExportJSON: () => void;
  onExportCSV: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  unsaved?: boolean; // modifiche non ancora esportate nel JSON
}

interface Props extends DataActions {
  view: View;
  onViewChange: (v: View) => void;
  onAdd: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  transactionCount: number;
}

export const Logo: FC<{ compact?: boolean }> = ({ compact }) => (
  <div className="flex items-center gap-2.5">
    <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-hero text-brand shadow-lg shadow-hero/20 dark:bg-brand dark:text-hero">
      <Wallet className="h-5 w-5" strokeWidth={2.4} />
    </div>
    {!compact && (
      <div className="leading-tight">
        <p className="text-[15px] font-extrabold tracking-tight">Budget</p>
        <p className="text-xs font-medium text-subtle">Tracker personale</p>
      </div>
    )}
  </div>
);

const actionBtn =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink";

/* ---------- Sidebar desktop ---------- */
export const SideNav: FC<Props> = ({
  view,
  onViewChange,
  onAdd,
  theme,
  onToggleTheme,
  onExportJSON,
  onExportCSV,
  onImport,
  unsaved,
  transactionCount,
}) => (
  <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
    <div className="flex items-center justify-between gap-2 px-2">
      <Logo />
      <button
        onClick={onToggleTheme}
        title={theme === "dark" ? "Tema chiaro" : "Tema scuro"}
        aria-label={theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro"}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-subtle transition-all hover:bg-surface-2 hover:text-ink active:scale-90"
      >
        {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </button>
    </div>

    <button
      onClick={onAdd}
      className="group mt-8 flex items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-bold text-hero shadow-lg shadow-brand/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/40 active:translate-y-0"
    >
      <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={3} />
      Nuova transazione
    </button>

    <nav className="mt-8 space-y-1">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">
        Menu
      </p>
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const active = view === id;
        return (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
              active
                ? "bg-hero text-white shadow-md dark:bg-surface-2 dark:text-ink"
                : "text-ink-soft hover:bg-surface-2 hover:text-ink",
            )}
          >
            <Icon className={cn("h-[18px] w-[18px]", active && "text-brand dark:text-brand")} />
            {label}
            {id === "transactions" && transactionCount > 0 && (
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold tabular",
                  active ? "bg-white/15 text-white dark:text-ink" : "bg-surface-2 text-subtle",
                )}
              >
                {transactionCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>

    <div className="mt-auto space-y-1 border-t border-line pt-4">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">
        Dati
      </p>
      <label className={cn(actionBtn, "cursor-pointer")}>
        <Upload className="h-4 w-4" />
        Importa JSON
        <input type="file" accept="application/json" onChange={onImport} className="hidden" />
      </label>
      <button onClick={onExportJSON} className={actionBtn}>
        <FileDown className="h-4 w-4" />
        Esporta JSON
        {unsaved && (
          <span
            className="ml-auto h-2 w-2 rounded-full bg-expense ring-4 ring-expense/15"
            title="Modifiche non ancora esportate"
          />
        )}
      </button>
      <button onClick={onExportCSV} className={actionBtn}>
        <FileDown className="h-4 w-4" />
        Esporta CSV
      </button>
    </div>
  </aside>
);

/* ---------- Menu dati mobile (in alto a destra) ---------- */
export const MobileMenu: FC<
  DataActions & { theme: Theme; onToggleTheme: () => void }
> = ({ theme, onToggleTheme, onExportJSON, onExportCSV, onImport, unsaved }) => {
  const [open, setOpen] = useState(false);
  const menuBtn =
    "flex w-full items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3.5 text-sm font-semibold text-ink transition-colors active:bg-line";

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Dati e preferenze"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-surface text-ink-soft"
      >
        <MoreHorizontal className="h-5 w-5" />
        {unsaved && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-expense ring-2 ring-surface" />}
      </button>
      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-hero/40 backdrop-blur-sm animate-in fade-in" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-3 rounded-3xl border border-line bg-surface p-4 shadow-2xl animate-in fade-in slide-in-from-top-4"
            style={{ top: "calc(4.5rem + env(safe-area-inset-top))" }}
          >
            <p className="px-1 pb-3 text-xs font-semibold uppercase tracking-wider text-subtle">
              Dati e preferenze
            </p>
            <div className="grid gap-2">
              <label className={cn(menuBtn, "cursor-pointer")}>
                <Upload className="h-4 w-4" />
                Importa JSON
                <input
                  type="file"
                  accept="application/json"
                  onChange={(e) => {
                    onImport(e);
                    setOpen(false);
                  }}
                  className="hidden"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { onExportJSON(); setOpen(false); }} className={menuBtn}>
                  <FileDown className="h-4 w-4" />
                  JSON
                  {unsaved && <span className="ml-auto h-2 w-2 rounded-full bg-expense" />}
                </button>
                <button onClick={() => { onExportCSV(); setOpen(false); }} className={menuBtn}>
                  <FileDown className="h-4 w-4" />
                  CSV
                </button>
              </div>
              {unsaved && (
                <p className="px-1 text-xs text-subtle">Ci sono modifiche non ancora esportate nel JSON.</p>
              )}
              <button onClick={onToggleTheme} className={menuBtn}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Tab bar mobile ---------- */
export const BottomNav: FC<Pick<Props, "view" | "onViewChange" | "onAdd">> = ({
  view,
  onViewChange,
  onAdd,
}) => {
  const tab = ({ id, label, icon: Icon }: (typeof NAV_ITEMS)[number]) => {
    const active = view === id;
    return (
      <button
        key={id}
        onClick={() => onViewChange(id)}
        className={cn(
          "flex min-w-0 flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold transition-colors",
          active ? "text-ink" : "text-subtle",
        )}
      >
        <span
          className={cn(
            "flex h-8 w-12 items-center justify-center rounded-full transition-all",
            active && "bg-brand/50 dark:bg-brand/15",
          )}
        >
          <Icon className={cn("h-5 w-5", active && "dark:text-brand")} />
        </span>
        <span className="max-w-full truncate">{label}</span>
      </button>
    );
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md items-end px-1">
        {tab(NAV_ITEMS[0])}
        {tab(NAV_ITEMS[1])}
        <div className="flex flex-1 justify-center">
          <button
            onClick={onAdd}
            aria-label="Nuova transazione"
            className="-mt-6 mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-hero text-brand shadow-xl shadow-hero/30 ring-4 ring-canvas transition-transform active:scale-95 dark:bg-brand dark:text-hero"
          >
            <Plus className="h-6 w-6" strokeWidth={3} />
          </button>
        </div>
        {tab(NAV_ITEMS[2])}
        {tab(NAV_ITEMS[3])}
      </div>
    </nav>
  );
};
