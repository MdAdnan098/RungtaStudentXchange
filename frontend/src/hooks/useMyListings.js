import { useCallback, useEffect, useState } from "react";
import { getMyListings } from "@/api/users";
import { getErrorMessage } from "@/utils/getErrorMessage";

/**
 * GET /users/me/listings (userController.js getMyListings) returns
 * every listing regardless of status — active, sold, AND removed —
 * unlike the public getProductsBySeller (Browse/Product Details),
 * which only returns active ones. That's exactly what "My Listings"
 * needs: a seller should still see their own sold/removed items.
 *
 * `updateListingLocally`/`removeListingLocally` let MyListings.jsx
 * reflect a status change or deletion immediately without refetching
 * the whole list — mirrors the optimistic-update pattern already used
 * in useWishlist.js.
 */
export const useMyListings = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchListings = useCallback((signal) => {
    setIsLoading(true);
    setIsError(false);

    getMyListings({ signal })
      .then((response) => {
        setListings(response.data.data.listings);
        setIsLoading(false);
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return;
        setIsError(true);
        setErrorMessage(getErrorMessage(error, "Failed to load your listings"));
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchListings(controller.signal);
    return () => controller.abort();
  }, [fetchListings]);

  const updateListingLocally = useCallback((productId, patch) => {
    setListings((current) => current.map((item) => (item._id === productId ? { ...item, ...patch } : item)));
  }, []);

  const removeListingLocally = useCallback((productId) => {
    setListings((current) => current.filter((item) => item._id !== productId));
  }, []);

  return {
    listings,
    isLoading,
    isError,
    errorMessage,
    refetch: () => fetchListings(),
    updateListingLocally,
    removeListingLocally,
  };
};
