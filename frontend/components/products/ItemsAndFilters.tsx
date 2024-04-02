"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ItemGrid } from "./ItemGrid";
import { FiltersType } from "@/api/filters.types";
import { Filters } from "./Filters";

type ItemsAndFiltersProps = {
  categoryName?: string;
  productName?: string;
};

export function ItemsAndFilters({
  categoryName,
  productName,
}: ItemsAndFiltersProps) {
  const [curFilters, setCurFilters] = useState<FiltersType>({
    tags: categoryName ? [categoryName] : undefined,
    product_name: productName,
  });

  const updateFilters = useCallback(
    (newFilters: FiltersType) => {
      if (newFilters.tags) {
        let { tags, ...rest } = newFilters;
        if (categoryName) tags.push(categoryName);

        setCurFilters({ ...rest, product_name: productName, tags: tags });
      } else {
        setCurFilters({
          ...newFilters,
          product_name: productName,
          tags: categoryName ? [categoryName] : undefined,
        });
      }
    },
    [categoryName, productName],
  );

  useEffect(() => {
    updateFilters({});
  }, [categoryName, productName, updateFilters]);

  return (
    <div className="flex flex-1 w-full mb-10 mt-8">
      <Filters onFiltersSave={updateFilters} />
      <ItemGrid filters={curFilters} />
    </div>
  );
}
