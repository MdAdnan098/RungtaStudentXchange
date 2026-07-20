import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllProductsAdmin } from "@/api/admin";
import { getErrorMessage } from "@/utils/getErrorMessage";

const PAGE_LIMIT = 20;

export const useAdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filters = {
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    category: searchParams.get("category") || "",
    page: Number(searchParams.get("page")) || 1,
  };

  const setFilter = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === "" || value === null || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
        if (key !== "page") next.delete("page");
        return next;
      });
    },
    [setSearchParams]
  );

  const filterKey = JSON.stringify(filters);

  const fetchProducts = useCallback(
    (signal) => {
      setIsLoading(true);
      setIsError(false);

      getAllProductsAdmin(
        {
          search: filters.search || undefined,
          status: filters.status || undefined,
          category: filters.category || undefined,
          page: filters.page,
          limit: PAGE_LIMIT,
        },
        { signal }
      )
        .then((response) => {
          setProducts(response.data.data.products);
          setTotal(response.data.data.total);
          setIsLoading(false);
        })
        .catch((error) => {
          if (error.code === "ERR_CANCELED") return;
          setIsError(true);
          setErrorMessage(getErrorMessage(error, "Failed to load listings"));
          setIsLoading(false);
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

  const updateProductLocally = useCallback((productId, patch) => {
    setProducts((current) =>
      current.map((product) => (product._id === productId ? { ...product, ...patch } : product))
    );
  }, []);

  const removeProductLocally = useCallback((productId) => {
    setProducts((current) => current.filter((product) => product._id !== productId));
    setTotal((current) => Math.max(0, current - 1));
  }, []);

  return {
    products,
    total,
    limit: PAGE_LIMIT,
    filters,
    setFilter,
    isLoading,
    isError,
    errorMessage,
    refetch: () => fetchProducts(),
    updateProductLocally,
    removeProductLocally,
  };
};
