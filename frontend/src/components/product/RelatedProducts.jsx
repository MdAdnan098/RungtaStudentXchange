import MarketplaceProductCard from "@/components/browse/MarketplaceProductCard";
import MarketplaceProductCardSkeleton from "@/components/browse/MarketplaceProductCardSkeleton";

const GRID_CLASS = "mt-5 grid grid-cols-2 gap-3 xs:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5";

/**
 * Uses the Marketplace-only card/skeleton fork (see
 * components/browse/MarketplaceProductCard.jsx) rather than the
 * original ProductCard — same card, same wishlist button, same
 * badges, just isolated from Wishlist/My Listings so this pass never
 * touches those pages.
 *
 * While related products are still being fetched, this renders a
 * skeleton row instead of nothing, so the section doesn't pop in and
 * shift the page once the request resolves. Still renders nothing at
 * all once loaded with zero results, rather than an empty section
 * with a heading and nothing under it.
 */
const RelatedProducts = ({ products, isLoading, wishlistedIds, onToggleWishlist }) => {
  if (!isLoading && products.length === 0) return null;

  return (
    <section aria-labelledby="related-products-heading" className="mt-10 border-t border-border pt-10">
      <h2 id="related-products-heading" className="text-h4">
        Related listings
      </h2>

      {isLoading ? (
        <div className={GRID_CLASS} aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading related listings…</span>
          {Array.from({ length: 4 }).map((_, index) => (
            <MarketplaceProductCardSkeleton key={index} />
          ))}
        </div>
      ) : (
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
      )}
    </section>
  );
};

export default RelatedProducts;
