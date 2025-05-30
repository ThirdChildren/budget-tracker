import { type FC, useMemo } from "react";
import { CategoryCard } from "./CategoryCard";
import type { Transaction } from "../types";
import React from "react";

interface Props {
  transactions: Transaction[];
}

export const CategoryList: FC<Props> = ({ transactions }) => {
  const categories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))),
    [transactions]
  );
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {categories.map((cat) => (
        <CategoryCard key={cat} category={cat} transactions={transactions} />
      ))}
    </div>
  );
};
