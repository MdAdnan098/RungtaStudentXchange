import { Link } from "react-router-dom";
import { AlertTriangle, PackagePlus, SearchX } from "lucide-react";
import MarketplaceProductCard from "@/components/browse/MarketplaceProductCard";
import MarketplaceProductCardSkeleton from "@/components/browse/MarketplaceProductCardSkeleton";
import EmptyState from "@/components/common/EmptyState";

const GRID_CLASS = "grid grid-cols-2 gap-3 xs:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-5 xl:grid-cols-5 xl:gap-6";

/**
 * Fork of components/browse/ProductGrid.jsx, used only on the Browse
 * Marketplace page — ProductGrid itself also backs Wishlist and My
 * Listings, so this pass leaves that file untouched and polishes a
 * dedicated copy instead. Same props/behavior as ProductGrid; the
 * loading/error/empty branches are the same shape, just using the
 * Marketplace-only card/skeleton fork above and a little extra
 * spacing/hierarchy polish.
 */
const BrowseProductGrid = ({
  isLoading,
  isError,
  errorMessage,
  products,
  hasActiveFilters,
  onRetry,
  onClearFilters,
  wishlistedIds,
  onToggleWishlist,
}) => {
  if (isLoading) {
    return (
      <div className={GRID_CLASS} aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading products…</span>
        {Array.from({ length: 8 }).map((_, index) => (
          <MarketplaceProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center rounded-2xl border border-danger/20 bg-danger-subtle px-6 py-16 text-center"
      >
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-h5 text-text">Couldn't load products</p>
        <p className="mt-1.5 max-w-sm text-body-sm text-text-muted">{errorMessage}</p>
        <button type="button" onClick={onRetry} className="btn-primary btn-sm mt-5 !rounded-xl shadow-sm btn-tactile hover:shadow-md">
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={hasActiveFilters ? "No products match your search" : "No listings yet"}
        description={
          hasActiveFilters
            ? "Try adjusting or clearing your filters to see more results."
            : "Be the first to list an item for fellow students to discover."
        }
        className="!py-20"
        action={
          hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="btn-primary !rounded-xl shadow-sm btn-tactile hover:shadow-md"
            >
              Clear filters
            </button>
          ) : (
            <Link
              to="/sell"
              className="btn-primary !rounded-xl shadow-sm btn-tactile hover:shadow-md"
            >
              <PackagePlus className="h-4 w-4" aria-hidden="true" />
              Create a listing
            </Link>
          )
        }
      />
    );
  }

  return (
    <div className={GRID_CLASS}>
      {products.map((product) => (
        <MarketplaceProductCard
          key={product._id}
          product={product}
          isWishlisted={wishlistedIds.has(product._id)}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  );
};

export default BrowseProductGrid;
