/**
 * Fork of components/browse/ProductCardSkeleton.jsx, kept separate
 * for the same reason as MarketplaceProductCard (isolated from
 * Wishlist/My Listings). Bar sizes are matched to
 * MarketplaceProductCard's actual content (two badge pills, one-line
 * title, price, footer row) so the loading → loaded swap doesn't
 * visibly reflow.
 */
const MarketplaceProductCardSkeleton = () => {
  return (
    <div className="card !rounded-2xl flex flex-col overflow-hidden" aria-hidden="true">
      <div className="aspect-[4/3] w-full animate-pulse bg-background-subtle" />
      <div className="flex flex-col gap-1.5 p-3 sm:p-3.5">
        <div className="flex gap-1.5">
          <div className="h-4 w-14 animate-pulse rounded-full bg-background-subtle" />
          <div className="h-4 w-12 animate-pulse rounded-full bg-background-subtle" />
        </div>
        <div className="h-3.5 w-full animate-pulse rounded bg-background-subtle" />
        <div className="h-4 w-16 animate-pulse rounded bg-background-subtle" />
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-1.5">
          <div className="h-2.5 w-16 animate-pulse rounded bg-background-subtle" />
          <div className="h-2.5 w-10 animate-pulse rounded bg-background-subtle" />
        </div>
      </div>
    </div>
  );
};

export default MarketplaceProductCardSkeleton;
