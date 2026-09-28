import {
  Bitcoin,
  Car,
  Home,
  Shirt,
  Film,
  UtensilsCrossed,
  Gift,
  Pill,
  Smartphone,
  Package,
  TrendingDown,
  TrendingUp,
  Wallet,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import type { TransactionType } from "@/types";

export type CategoryConfig = {
  name: string;
  icon: LucideIcon;
  color: string; // hex, usato per icone, barre e grafici
};

// Unica fonte per icone e colori delle categorie: card, form e grafici restano coerenti
export const CATEGORIES: CategoryConfig[] = [
  { name: "Cibo", icon: UtensilsCrossed, color: "#10b981" },
  { name: "Casa", icon: Home, color: "#8b5cf6" },
  { name: "Trasporti", icon: Car, color: "#3b82f6" },
  { name: "Abbigliamento", icon: Shirt, color: "#ec4899" },
  { name: "Intrattenimento", icon: Film, color: "#f59e0b" },
  { name: "Regali", icon: Gift, color: "#ef4444" },
  { name: "Farmacia", icon: Pill, color: "#06b6d4" },
  { name: "Ricarica", icon: Smartphone, color: "#6366f1" },
  { name: "Piano accumulo bitcoin", icon: Bitcoin, color: "#f7931a" },
  { name: "Altro", icon: Package, color: "#64748b" },
];

const categoryMap = new Map(CATEGORIES.map((c) => [c.name, c]));

export const getCategory = (name: string): CategoryConfig =>
  categoryMap.get(name) ?? { ...categoryMap.get("Altro")!, name };

// Sfondo tenue a partire dal colore della categoria (hex + alpha)
export const tint = (hex: string, alpha = "1f") => `${hex}${alpha}`;

export type TypeConfig = {
  label: string;
  plural: string;
  icon: LucideIcon;
  sign: "+" | "-";
  text: string;
  bg: string;
  solid: string;
  cssVar: string;
};

export const TYPES: Record<TransactionType, TypeConfig> = {
  expense: {
    label: "Spesa",
    plural: "Spese",
    icon: TrendingDown,
    sign: "-",
    text: "text-expense",
    bg: "bg-expense/10",
    solid: "bg-expense text-white",
    cssVar: "var(--expense)",
  },
  refund: {
    label: "Rimborso",
    plural: "Rimborsi",
    icon: TrendingUp,
    sign: "+",
    text: "text-income",
    bg: "bg-income/10",
    solid: "bg-income text-white",
    cssVar: "var(--income)",
  },
  salary: {
    label: "Stipendio",
    plural: "Stipendi",
    icon: Wallet,
    sign: "+",
    text: "text-salary",
    bg: "bg-salary/10",
    solid: "bg-salary text-white",
    cssVar: "var(--salary)",
  },
  obligation: {
    label: "Obbligazioni",
    plural: "Obbligazioni",
    icon: Landmark,
    sign: "+",
    text: "text-bond",
    bg: "bg-bond/10",
    solid: "bg-bond text-white",
    cssVar: "var(--bond)",
  },
};

export const TYPE_ORDER: TransactionType[] = [
  "expense",
  "refund",
  "salary",
  "obligation",
];
