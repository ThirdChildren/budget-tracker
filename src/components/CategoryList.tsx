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
    <div
      className="
        grid gap-5
        sm:grid-cols-2       /* 2 colonne da 640 px in su  */
        lg:grid-cols-3       /* 3 colonne da 1024 px in su */
        2xl:grid-cols-4      /* 4 colonne su schermi grandi */
      "
    >
      {categories.map((cat) => (
        <CategoryCard key={cat} category={cat} transactions={transactions} />
      ))}
    </div>
  );
};
