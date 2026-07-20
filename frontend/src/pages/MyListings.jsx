import { Link } from "react-router-dom";
import { AlertTriangle, PackagePlus } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import EmptyState from "@/components/common/EmptyState";
import ProductCardSkeleton from "@/components/browse/ProductCardSkeleton";
import ProfileStats from "@/components/profile/ProfileStats";
import MyListingCard from "@/components/profile/MyListingCard";
import { useMyListings } from "@/hooks/useMyListings";
import { useWishlist } from "@/hooks/useWishlist";
import { usePageTitle } from "@/hooks/usePageTitle";

/**
 * Doesn't reuse ProductGrid (Browse's grid/loading/error/empty
 * orchestrator) — it renders ProductCard directly with no slot for
 * the owner-action row this page needs underneath each card, and
 * extending it would mean modifying a Browse-domain component this
 * task shouldn't touch. Instead this reuses ProductCardSkeleton and
 * EmptyState directly (both already generic, already used outside
 * Browse — e.g. EmptyState across Product Details/Wishlist/Chat).
 */
const MyListings = () => {
  usePageTitle("My Listings");

  const { listings, isLoading, isError, errorMessage, refetch, updateListingLocally, removeListingLocally } =
    useMyListings();
  const { wishlistedIds, toggle } = useWishlist();

  return (
    <Section spacing="md">
      <PageContainer>
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-h2">My Listings</h1>
            <p className="mt-1.5 text-body-sm text-text-muted">Manage the items you've listed for sale.</p>
          </div>
          <Link
            to="/sell"
            className="btn-primary w-full justify-center py-3 !rounded-xl shadow-sm btn-tactile hover:shadow-md sm:w-auto sm:py-2.5"
          >
            <PackagePlus className="h-4 w-4" aria-hidden="true" />
            Create Listing
          </Link>
        </div>

        {!isLoading && !isError && listings.length > 0 && (
          <div className="mb-7">
            <ProfileStats listings={listings} />
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load your listings"
            description={errorMessage}
            className="py-14 sm:py-16"
            action={
              <button type="button" onClick={refetch} className="btn-primary btn-sm">
                Retry
              </button>
            }
          />
        ) : listings.length === 0 ? (
          <EmptyState
            icon={PackagePlus}
            title="You haven't listed anything yet"
            description="Create your first listing to start selling to fellow students."
            className="py-14 sm:py-16"
            action={
              <Link to="/sell" className="btn-primary btn-sm">
                Create Listing
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((product) => (
              <MyListingCard
                key={product._id}
                product={product}
                wishlistedIds={wishlistedIds}
                onToggleWishlist={toggle}
                onStatusChange={updateListingLocally}
                onDeleted={removeListingLocally}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </Section>
  );
};

export default MyListings;
