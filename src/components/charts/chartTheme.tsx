import type { ReactNode } from "react";

// Colori fissi per i grafici (SVG non legge le variabili CSS in modo affidabile)
export const chartColors = (dark: boolean) => ({
  expense: dark ? "#fb7185" : "#f43f5e",
  income: dark ? "#34d399" : "#10b981",
  accent: dark ? "#c6f36b" : "#0f1a14",
  muted: dark ? "#3a463e" : "#d5dacd",
  grid: dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,18,0.07)",
  tick: dark ? "#8a948c" : "#6b736c",
});

export const ChartTooltipBox = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl border border-line bg-surface/95 px-3.5 py-2.5 text-xs shadow-xl backdrop-blur">
    {children}
  </div>
);
