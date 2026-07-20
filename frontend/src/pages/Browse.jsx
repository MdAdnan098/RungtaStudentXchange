import { useEffect, useRef, useState } from "react";
import { ShoppingBag, SlidersHorizontal } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import SearchBar from "@/components/browse/SearchBar";
import SortDropdown from "@/components/browse/SortDropdown";
import FilterSidebar from "@/components/browse/FilterSidebar";
import FilterDrawer from "@/components/browse/FilterDrawer";
import ActiveFilterChips from "@/components/browse/ActiveFilterChips";
import ProductGrid from "@/components/browse/BrowseProductGrid";
import Pagination from "@/components/browse/Pagination";
import { useProductFilters } from "@/hooks/useProductFilters";
import { useProducts, PRODUCTS_PAGE_LIMIT } from "@/hooks/useProducts";
import { useWishlist } from "@/hooks/useWishlist";
import { usePageTitle } from "@/hooks/usePageTitle";


/**
 * Owns data fetching (useProducts) and URL-driven filter state
 * (useProductFilters) and hands both down to presentational
 * components — FilterSidebar/FilterDrawer share FilterFields,
 * ProductGrid owns its own loading/error/empty branching, so this
 * component stays mostly layout + wiring.
 */
const Browse = () => {
  usePageTitle("Browse Marketplace");

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const { filters, setFilter, setPage, clearFilters, activeFilterCount } = useProductFilters();
  const { products, total, isLoading, isError, errorMessage, refetch } = useProducts(filters);
  const { wishlistedIds, toggle } = useWishlist();

  const hasActiveFilters = activeFilterCount > 0 || Boolean(filters.search);

  // Paging replaces the grid's contents without any navigation, so
  // without this a reader scrolled down to page 1's last row stays at
  // that same scroll offset after clicking "2" — landing them
  // mid-page-3-of-nothing instead of at the top of the new results.
  // Keyed on `filters.page` specifically (not the whole filters
  // object) so typing in search or toggling a filter — which resets
  // page to 1 anyway — doesn't also yank the scroll position while
  // someone's still reading/typing near the top of the page.
  const resultsTopRef = useRef(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    resultsTopRef.current?.scrollIntoView({ block: "start" });
  }, [filters.page]);

  const filterFieldsProps = { filters, setFilter, clearFilters, activeFilterCount };

  return (
    <Section spacing="md">
      <PageContainer>
        <div className="mb-7 flex items-start gap-3 md:mb-8">
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary-subtle-text sm:flex">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-h2">Browse Marketplace</h1>
            <p className="mt-1.5 text-body-sm text-text-muted">
              Find books, electronics, and campus essentials from fellow students.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar value={filters.search} onChange={(value) => setFilter("search", value)} />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="btn-secondary h-12 !rounded-xl shadow-xs transition-shadow duration-base ease-standard hover:shadow-sm lg:hidden"
              aria-haspopup="dialog"
              aria-expanded={isFilterDrawerOpen}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-overline text-text-inverse">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <SortDropdown value={filters.sort} onChange={(value) => setFilter("sort", value)} />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4">
            <ActiveFilterChips filters={filters} setFilter={setFilter} />
          </div>
        )}

        <div className="mt-6 flex items-start gap-6 lg:gap-8 xl:gap-10 md:mt-7">
          <FilterSidebar {...filterFieldsProps} />

          <div ref={resultsTopRef} className="min-w-0 flex-1 scroll-mt-20">
            {!isLoading && !isError && total > 0 && (
              <p className="mb-4 text-body-sm text-text-muted" role="status" aria-live="polite">
                <span className="font-medium text-text-secondary">{total}</span> {total === 1 ? "item" : "items"} found
              </p>
            )}

            <ProductGrid
              isLoading={isLoading}
              isError={isError}
              errorMessage={errorMessage}
              products={products}
              hasActiveFilters={hasActiveFilters}
              onRetry={refetch}
              onClearFilters={clearFilters}
              wishlistedIds={wishlistedIds}
              onToggleWishlist={toggle}
            />

            {!isLoading && !isError && (
              <Pagination page={filters.page} limit={PRODUCTS_PAGE_LIMIT} total={total} onPageChange={setPage} />
            )}
          </div>
        </div>
      </PageContainer>

      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        resultCount={total}
        {...filterFieldsProps}
      />
    </Section>
  );
};

export default Browse;
