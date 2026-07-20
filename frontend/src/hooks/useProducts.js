import { useCallback, useEffect, useState } from "react";
import { getProducts } from "@/api/products";
import { getErrorMessage } from "@/utils/getErrorMessage";

export const PRODUCTS_PAGE_LIMIT = 20;

const buildParams = (filters) => ({
  search: filters.search || undefined,
  category: filters.category || undefined,
  condition: filters.condition || undefined,
  minPrice: filters.minPrice || undefined,
  maxPrice: filters.maxPrice || undefined,
  studentOnly: filters.studentOnly || undefined,
  sort: filters.sort,
  page: filters.page,
  limit: PRODUCTS_PAGE_LIMIT,
});

/**
 * Fetches GET /products for the current `filters` (from
 * useProductFilters — i.e. the URL). Re-fetches whenever the
 * serialized filters change. Each fetch cancels the previous
 * in-flight request via AbortController, so if the user changes sort
 * right after typing a search term, a slow "old filters" response
 * can never overwrite the "new filters" result that arrived first.
 */
export const useProducts = (filters) => {
  const [state, setState] = useState({
    products: [],
    total: 0,
    isLoading: true,
    isError: false,
    errorMessage: "",
  });

  const filterKey = JSON.stringify(filters);

  const fetchProducts = useCallback(
    (signal) => {
      setState((prev) => ({ ...prev, isLoading: true, isError: false }));

      getProducts(buildParams(filters), { signal })
        .then((response) => {
          const { products, total } = response.data.data;
          setState({ products, total, isLoading: false, isError: false, errorMessage: "" });
        })
        .catch((error) => {
          if (error.code === "ERR_CANCELED") return; // superseded by a newer request
          setState({
            products: [],
            total: 0,
            isLoading: false,
            isError: true,
            errorMessage: getErrorMessage(error, "Failed to load products"),
          });
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [filterKey]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const refetch = useCallback(() => fetchProducts(), [fetchProducts]);

  return { ...state, refetch };
};
