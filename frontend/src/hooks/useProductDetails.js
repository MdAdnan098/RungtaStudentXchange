import { useCallback, useEffect, useState } from "react";
import { getProductById } from "@/api/products";
import { getErrorMessage } from "@/utils/getErrorMessage";

/**
 * Mirrors the shape of useProducts.js (Browse) but for a single
 * product — same AbortController-cancel-on-change pattern, same
 * {isLoading, isError, errorMessage} contract, so this page's loading/
 * error branching reads the same way Browse's does.
 *
 * `isNotFound` is broken out separately from `isError` because a 404
 * ("this product doesn't exist / was deleted") is a distinct, expected
 * state from a genuine network/server error — they render differently
 * (see ProductDetails.jsx).
 */
export const useProductDetails = (productId) => {
  const [state, setState] = useState({
    product: null,
    isLoading: true,
    isError: false,
    isNotFound: false,
    errorMessage: "",
  });

  const fetchProduct = useCallback(
    (signal) => {
      setState((prev) => ({ ...prev, isLoading: true, isError: false, isNotFound: false }));

      getProductById(productId, { signal })
        .then((response) => {
          setState({
            product: response.data.data.product,
            isLoading: false,
            isError: false,
            isNotFound: false,
            errorMessage: "",
          });
        })
        .catch((error) => {
          if (error.code === "ERR_CANCELED") return;

          const isNotFound = error.response?.status === 404;
          setState({
            product: null,
            isLoading: false,
            isError: !isNotFound,
            isNotFound,
            errorMessage: getErrorMessage(error, "Failed to load this product"),
          });
        });
    },
    [productId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProduct(controller.signal);
    return () => controller.abort();
  }, [fetchProduct]);

  const refetch = useCallback(() => fetchProduct(), [fetchProduct]);

  return { ...state, refetch };
};
