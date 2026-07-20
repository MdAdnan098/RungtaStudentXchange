import { create } from "zustand";

/**
 * Extended in Task 10 to also cache full product objects (`products`)
 * alongside the existing `ids` Set — additively, not a rewrite.
 * Every field/action that existed before this task (`ids`, `isLoaded`,
 * `add`, `remove`, `has`, `reset`) is unchanged, so Browse, Product
 * Details, and RelatedProducts (all built against the pre-Task-10
 * shape) keep working with zero changes.
 *
 * Why extend this store instead of adding a new one for the Wishlist
 * page: GET /users/me/wishlist already returns full Product objects
 * (see backend/controllers/userController.js getWishlist) — the old
 * code was fetching that and then throwing away everything except
 * `_id`. The Wishlist page needs the full objects; caching them here,
 * from the exact same response the ID-only fetch was already making,
 * means "fetch once, use everywhere" instead of the Wishlist page
 * making its own separate, duplicate GET request.
 *
 * `status`/`error` are new so the Wishlist page can show a proper
 * loading/error state — the pre-existing fetch (in useWishlist.js)
 * silently swallowed errors, which was fine when the only consumer
 * was a heart-icon button ("best effort, keep working either way")
 * but isn't enough for a page whose entire job is showing this data.
 */
export const useWishlistStore = create((set, get) => ({
  ids: new Set(),
  isLoaded: false,
  products: [],
  status: "idle", // "idle" | "loading" | "loaded" | "error"
  error: null,
  // Which user's wishlist `ids`/`products` currently reflect. This
  // store is a single module-level singleton — it doesn't know on its
  // own when the logged-in user changes (e.g. Login.jsx calling
  // setAuth() for a different account while isAuthenticated was
  // already true, so nothing ever flips false→true to trigger a
  // reset). Tracking the owning user id lets useWishlist detect that
  // mismatch and refetch instead of showing the previous user's
  // wishlist state.
  loadedForUserId: null,

  // Single entry point for a full GET /users/me/wishlist response —
  // derives `ids` from the same array so the two can never drift out
  // of sync. Filters out `null` entries defensively: Mongoose's
  // populate() returns null (not omitted) for a wishlist entry whose
  // referenced product no longer exists (see backend limitations in
  // the final summary) — left unfiltered, `product._id` on a null
  // entry would throw.
  setWishlistData: (rawProducts, userId = null) => {
    const products = (rawProducts || []).filter(Boolean);
    set({
      products,
      ids: new Set(products.map((product) => product._id)),
      isLoaded: true,
      status: "loaded",
      error: null,
      loadedForUserId: userId,
    });
  },

  setStatus: (status) => set({ status }),
  setError: (error) => set({ status: "error", error }),

  add: (productId) =>
    set((state) => {
      const next = new Set(state.ids);
      next.add(productId);
      return { ids: next };
    }),

  remove: (productId) =>
    set((state) => {
      const next = new Set(state.ids);
      next.delete(productId);
      return { ids: next };
    }),

  has: (productId) => get().ids.has(productId),

  reset: () => set({ ids: new Set(), isLoaded: false, products: [], status: "idle", error: null, loadedForUserId: null }),
}));
