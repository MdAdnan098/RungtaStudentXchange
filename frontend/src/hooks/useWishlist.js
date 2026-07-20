import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { getWishlist, addToWishlist, removeFromWishlist } from "@/api/wishlist";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/utils/getErrorMessage";

/**
 * Everything Browse/Product Details/RelatedProducts already use
 * (`wishlistedIds`, `toggle`) is unchanged in shape and behavior.
 * Added for the Wishlist page: `products` (full objects, cached from
 * the same fetch), `status`/`error` (proper loading/error state,
 * where the old effect silently swallowed failures), and `refetch`.
 */
export const useWishlist = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUserId = useAuthStore((state) => state.user?._id) || null;
  const ids = useWishlistStore((state) => state.ids);
  const products = useWishlistStore((state) => state.products);
  const status = useWishlistStore((state) => state.status);
  const error = useWishlistStore((state) => state.error);
  const setWishlistData = useWishlistStore((state) => state.setWishlistData);
  const setStatus = useWishlistStore((state) => state.setStatus);
  const setError = useWishlistStore((state) => state.setError);
  const addId = useWishlistStore((state) => state.add);
  const removeId = useWishlistStore((state) => state.remove);
  const reset = useWishlistStore((state) => state.reset);

  const fetchWishlist = useCallback(() => {
    setStatus("loading");
    return getWishlist()
      .then((response) => setWishlistData(response.data.data.wishlist, currentUserId))
      .catch((err) => setError(getErrorMessage(err, "Failed to load your wishlist")));
  }, [setStatus, setWishlistData, setError, currentUserId]);

  useEffect(() => {
    if (!isAuthenticated) {
      reset();
      return;
    }

    // Read the store directly (not the reactive `isLoaded`/`status`
    // destructured above) so this check sees the *latest* value even
    // if another component's `useWishlist()` call already started a
    // fetch in this same render pass — without this, two components
    // mounting together could both see "not loaded yet" and both
    // fire GET /users/me/wishlist.
    const state = useWishlistStore.getState();

    // isAuthenticated can stay `true` across a user switch (Login /
    // Register / AdminLogin / AdminRegister call setAuth() directly
    // without logging out first), so a stale wishlist for the
    // *previous* account can otherwise survive un-reset and leak into
    // the new session. Comparing the id the cached data was loaded
    // for against who's logged in now catches that case too.
    if (state.loadedForUserId !== null && state.loadedForUserId !== currentUserId) {
      reset();
      fetchWishlist();
      return;
    }

    if (state.isLoaded || state.status === "loading") return;

    fetchWishlist();
  }, [isAuthenticated, currentUserId, reset, fetchWishlist]);

  const toggle = useCallback(
    async (productId) => {
      if (!isAuthenticated) {
        toast.error("Log in to save items to your wishlist");
        return;
      }

      const isWishlisted = ids.has(productId);

      // Optimistic update — reverted below if the request fails. Note
      // this only touches `ids`, not the cached `products` array; the
      // Wishlist page derives its displayed list as
      // `products.filter(p => ids.has(p._id))`, so a removal still
      // disappears instantly without needing `products` itself
      // touched here.
      if (isWishlisted) {
        removeId(productId);
      } else {
        addId(productId);
      }

      try {
        if (isWishlisted) {
          await removeFromWishlist(productId);
        } else {
          await addToWishlist(productId);
        }
      } catch (error) {
        // Revert
        if (isWishlisted) {
          addId(productId);
        } else {
          removeId(productId);
        }
        toast.error(getErrorMessage(error, "Couldn't update your wishlist"));
      }
    },
    [isAuthenticated, ids, addId, removeId]
  );

  return { wishlistedIds: ids, products, status, error, toggle, refetch: fetchWishlist };
};
