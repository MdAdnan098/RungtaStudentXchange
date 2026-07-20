import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const DEFAULT_SORT = "newest";

/**
 * The brief asks for filters to "survive refresh" and search to be
 * "preserved in URL" — the URL query string *is* that persistence
 * layer, so there's no separate Zustand store for filter state (a
 * localStorage-persisted store would survive refresh too, but
 * wouldn't be shareable/bookmarkable/back-button-friendly the way a
 * URL is, which is what a marketplace listing page actually wants).
 *
 * Returns a typed `filters` object (numbers/booleans, not raw
 * strings) plus setters that update the URL. Changing any filter
 * other than page resets page back to 1 — standard listing-page
 * behavior, and it's centralized here so no caller has to remember
 * to do it.
 */
export const useProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      condition: searchParams.get("condition") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      studentOnly: searchParams.get("studentOnly") === "true",
      sort: searchParams.get("sort") || DEFAULT_SORT,
      page: Number(searchParams.get("page")) || 1,
    }),
    [searchParams]
  );

  const setFilter = useCallback(
    (key, value, { resetPage = true } = {}) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        if (value === "" || value === false || value === null || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }

        if (resetPage && key !== "page") {
          next.delete("page");
        }

        return next;
      });
    },
    [setSearchParams]
  );

  const setPage = useCallback((page) => setFilter("page", page, { resetPage: false }), [setFilter]);

  // Clears everything except `search` — the search bar is its own
  // top-level control, distinct from the filter panel, matching how
  // marketplaces like OLX/Facebook Marketplace separate the two.
  const clearFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      ["category", "condition", "minPrice", "maxPrice", "studentOnly", "sort", "page"].forEach((key) =>
        next.delete(key)
      );
      return next;
    });
  }, [setSearchParams]);

  const activeFilterCount = [filters.category, filters.condition, filters.minPrice, filters.maxPrice, filters.studentOnly].filter(
    Boolean
  ).length;

  return { filters, setFilter, setPage, clearFilters, activeFilterCount };
};
