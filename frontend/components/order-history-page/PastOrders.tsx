"use client";

import { getUserOrderHistory } from "@/api/product";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { ProductEntry } from "./ProductEntry";

export function PastOrders() {
  const { data } = useQuery({
    queryKey: ["Order History"],
    queryFn: getUserOrderHistory,
  });

  return (
    <div className="mx-4">
      <div className="max-h-[80vh] overflow-y-auto px-2">
        {data?.map((item) => (
          <div className="mb-10">
            {item.products.map((product) => (
              <ProductEntry productEntry={product} />
            ))}
            <p>Order Date: {new Date(item.order_date * 1000).toUTCString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
