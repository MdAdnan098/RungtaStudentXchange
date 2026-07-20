import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Heart } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import EmptyState from "@/components/common/EmptyState";
import ProductCardSkeleton from "@/components/browse/ProductCardSkeleton";
import WishlistCard from "@/components/wishlist/WishlistCard";
import { useWishlist } from "@/hooks/useWishlist";
import { usePageTitle } from "@/hooks/usePageTitle";

/**
 * Doesn't reuse ProductGrid (Browse's grid/loading/error/empty
 * orchestrator) — same reasoning as MyListings: ProductGrid has no
 * slot for the explicit View Details/Remove action row this page now
 * wants underneath each card, and extending it would mean modifying
 * a Browse-domain component this task shouldn't touch. Instead this
 * reuses ProductCardSkeleton and EmptyState directly, exactly like
 * MyListings does, and renders WishlistCard (not ProductCard) for the
 * loaded grid.
 */
const Wishlist = () => {
  usePageTitle("Wishlist");

  const { wishlistedIds, products, status, error, toggle, refetch } = useWishlist();

  const displayedProducts = useMemo(
    () => products.filter((product) => wishlistedIds.has(product._id)),
    [products, wishlistedIds]
  );

  // Reconciliation, not polling: if the wishlist gained an id that
  // isn't in the cached `products` yet (e.g. something was wishlisted
  // from Browse in another tab, or before this store had ever loaded
  // full product data), refetch once to pick up its full data. Never
  // fires from a *removal* — that only shrinks `wishlistedIds`, which
  // can't create a "missing" id — so this can't loop.
  const hasMissingProductData = useMemo(
    () => [...wishlistedIds].some((id) => !products.some((product) => product._id === id)),
    [wishlistedIds, products]
  );

  useEffect(() => {
    if (status === "loaded" && hasMissingProductData) refetch();
  }, [status, hasMissingProductData, refetch]);

  const isLoading = status === "idle" || status === "loading";
  const isError = status === "error";

  return (
    <Section spacing="md">
      <PageContainer>
        <div className="mb-7">
          <h1 className="text-h2">My Wishlist</h1>
          <p className="mt-1.5 text-body-sm text-text-muted">Items you've saved to review or buy later.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
            <span className="sr-only">Loading your wishlist…</span>
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load your wishlist"
            description={error}
            className="py-14 sm:py-16"
            action={
              <button type="button" onClick={refetch} className="btn-primary btn-sm">
                Retry
              </button>
            }
          />
        ) : displayedProducts.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save items you're interested in and they'll show up here."
            className="py-14 sm:py-16"
            action={
              <Link to="/browse" className="btn-primary btn-sm">
                Browse Marketplace
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedProducts.map((product) => (
              <WishlistCard key={product._id} product={product} onRemove={toggle} />
            ))}
          </div>
        )}
      </PageContainer>
    </Section>
  );
};

export default Wishlist;
