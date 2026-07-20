import { useEffect, useState } from "react";
import { getProductsBySeller } from "@/api/products";

/**
 * The User model has no precomputed listing count, so this counts
 * the array length from GET /products/seller/:sellerId (an existing,
 * already-public endpoint — see productController.js
 * getProductsBySeller). That endpoint only returns `status: "active"`
 * listings, so this count is "active listings," not "all-time
 * listings" — noted in SellerCard's copy ("X active listings").
 */
export const useSellerListingCount = (sellerId) => {
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!sellerId) return;

    const controller = new AbortController();

    getProductsBySeller(sellerId, { signal: controller.signal })
      .then((response) => setCount(response.data.data.products.length))
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return;
        setCount(null);
      });

    return () => controller.abort();
  }, [sellerId]);

  return count;
};
