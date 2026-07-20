import { useEffect, useState } from "react";
import { getProducts } from "@/api/products";

const RELATED_LIMIT = 5; // fetch one extra since the current product is filtered out client-side

/**
 * There's no dedicated "related products" endpoint — this reuses the
 * same GET /products the Browse page uses, filtered to the current
 * product's category, and drops the current product from the result
 * client-side (the backend has no "exclude ID" param). Deliberately
 * not built on top of useProducts.js (Browse's hook): that hook reads
 * its filters from the URL via useProductFilters, which would be the
 * wrong source of truth here — this is a self-contained data need,
 * not page-level filter state.
 */
export const useRelatedProducts = (category, excludeProductId) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    getProducts({ category, sort: "newest", page: 1, limit: RELATED_LIMIT }, { signal: controller.signal })
      .then((response) => {
        const results = response.data.data.products.filter((product) => product._id !== excludeProductId);
        setProducts(results.slice(0, RELATED_LIMIT - 1));
        setIsLoading(false);
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return; // a newer request is already in flight
        setProducts([]);
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [category, excludeProductId]);

  return { relatedProducts: products, isLoading };
};
