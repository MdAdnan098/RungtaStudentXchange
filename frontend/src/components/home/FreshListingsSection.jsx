import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { getProducts } from "@/api/products";
import { useWishlist } from "@/hooks/useWishlist";
import { getErrorMessage } from "@/utils/getErrorMessage";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import FreshListingCard from "@/components/home/FreshListingCard";
import FreshListingCardSkeleton from "@/components/home/FreshListingCardSkeleton";
import EmptyState from "@/components/common/EmptyState";

const HOMEPAGE_LISTING_COUNT = 10;

/**
 * A lightweight, homepage-only fetch (newest N products, no filters) —
 * deliberately not routed through useProducts/useProductFilters since
 * those are coupled to Browse's URL-driven filter state, which this
 * section doesn't need. Wishlist toggling reuses useWishlist exactly
 * as Browse and the Wishlist page do, so a heart tap here stays in
 * sync everywhere else.
 */
const FreshListingsSection = () => {
  const [state, setState] = useState({ products: [], isLoading: true, isError: false, errorMessage: "" });
  const { wishlistedIds, toggle } = useWishlist();

  useEffect(() => {
    const controller = new AbortController();

    getProducts({ sort: "newest", limit: HOMEPAGE_LISTING_COUNT }, { signal: controller.signal })
      .then((response) => {
        setState({ products: response.data.data.products, isLoading: false, isError: false, errorMessage: "" });
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return;
        setState({
          products: [],
          isLoading: false,
          isError: true,
          errorMessage: getErrorMessage(error, "Failed to load listings"),
        });
      });

    return () => controller.abort();
  }, []);

  return (
    <Section aria-labelledby="fresh-listings-heading">
      <PageContainer>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="fresh-listings-heading" className="text-h2">
              Fresh listings
            </h2>
            <p className="mt-2 text-body text-text-muted">Fresh items from students near you, as soon as they're posted.</p>
          </div>
          <Link
            to="/browse"
            className="hidden shrink-0 text-body-sm font-medium text-primary hover:text-primary-hover transition-colors duration-base ease-standard sm:inline-block"
          >
            Browse all →
          </Link>
        </div>

        <div className="mt-7 sm:mt-8">
          {state.isLoading && (
            <div className="grid grid-cols-2 gap-3.5 xs:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: HOMEPAGE_LISTING_COUNT }).map((_, index) => (
                <FreshListingCardSkeleton key={index} />
              ))}
            </div>
          )}

          {!state.isLoading && state.isError && (
            <EmptyState
              icon={PackageSearch}
              title="Couldn't load listings"
              description={state.errorMessage}
            />
          )}

          {!state.isLoading && !state.isError && state.products.length === 0 && (
            <EmptyState
              icon={PackageSearch}
              title="No listings yet"
              description="Be the first to list an item for fellow students to discover."
              action={
                <Link to="/sell" className="btn-primary btn-sm">
                  Create the first listing
                </Link>
              }
            />
          )}

          {!state.isLoading && !state.isError && state.products.length > 0 && (
            <div className="grid grid-cols-2 gap-3.5 xs:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5">
              {state.products.map((product) => (
                <FreshListingCard
                  key={product._id}
                  product={product}
                  isWishlisted={wishlistedIds.has(product._id)}
                  onToggleWishlist={toggle}
                />
              ))}
            </div>
          )}
        </div>

        <Link to="/browse" className="btn-secondary btn-sm mt-6 w-full sm:hidden">
          Browse all listings
        </Link>
      </PageContainer>
    </Section>
  );
};

export default FreshListingsSection;
