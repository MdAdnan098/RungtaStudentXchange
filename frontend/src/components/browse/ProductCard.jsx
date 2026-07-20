import { Link } from "react-router-dom";
import { Heart, BadgeCheck } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { CONDITION_BADGE_CLASS } from "@/constants/conditionBadges";
import { STATUS_BADGE_CLASS, STATUS_LABEL } from "@/constants/statusBadges";
import { cn } from "@/utils/cn";

/**
 * Compact preview card for grids (Browse, Wishlist, Related Products,
 * My Listings). Deliberately smaller than the full Product Details
 * page — only image, title, price, category, condition, wishlist
 * toggle, verified badge, and posted time. No separate "View Details"
 * button: the image and title are already links to `/products/:id`,
 * where the complete, uncompacted view lives unchanged.
 *
 * Visual treatment (rounded corners, spacing, price weight, wishlist
 * button) mirrors components/home/FreshListingCard so Browse reads as
 * the same design language as the homepage — presentation only, same
 * props and behavior as before.
 *
 * `showStatusBadge` is opt-in and off by default: Browse/Wishlist/Home
 * only ever list active items, so a status badge would be redundant
 * noise there. My Listings (the only place an owner sees sold/removed
 * items mixed in) turns it on explicitly.
 */
const ProductCard = ({ product, isWishlisted, onToggleWishlist, showStatusBadge = false }) => {
  const coverImage = product.images?.[0]?.url;

  return (
    <div
      className={cn(
        "card card-hover group relative flex flex-col overflow-hidden",
        "!rounded-2xl",
        "transition-all duration-slow ease-standard",
        "hover:-translate-y-1 active:translate-y-0 active:duration-fast"
      )}
    >
      {showStatusBadge && product.status && STATUS_LABEL[product.status] && (
        <span
          className={cn(
            STATUS_BADGE_CLASS[product.status],
            "absolute left-2 top-2 z-10 !px-2 !py-0.5 !text-[0.65rem] shadow-xs"
          )}
        >
          {STATUS_LABEL[product.status]}
        </span>
      )}

      <button
        type="button"
        onClick={() => onToggleWishlist(product._id)}
        className={cn(
          "absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full",
          "bg-surface/90 text-text-secondary shadow-sm backdrop-blur-sm",
          "transition-all duration-base ease-standard",
          "hover:bg-surface hover:text-danger hover:scale-105 active:scale-90"
        )}
        aria-pressed={isWishlisted}
        aria-label={isWishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
      >
        <Heart
          className={cn("h-4 w-4 transition-transform duration-base ease-standard", isWishlisted && "fill-danger text-danger")}
          aria-hidden="true"
        />
      </button>

      <Link to={`/products/${product._id}`} className="block aspect-[4/3] w-full overflow-hidden bg-background-subtle">
        {coverImage ? (
          <img
            src={coverImage}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-slow ease-standard group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-caption text-text-muted">No image</div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="badge-neutral !px-1.5 !py-0.5 !text-[0.625rem]">{product.category}</span>
          <span className={cn(CONDITION_BADGE_CLASS[product.condition] || "badge-neutral", "!px-1.5 !py-0.5 !text-[0.625rem]")}>
            {product.condition}
          </span>
        </div>

        <Link
          to={`/products/${product._id}`}
          className="line-clamp-1 text-caption font-semibold leading-snug text-text transition-colors duration-base ease-standard hover:text-primary sm:text-body-sm"
        >
          {product.title}
        </Link>

        <p className="font-display text-body-sm font-bold tracking-tight text-text sm:text-body">
          {formatPrice(product.price)}
        </p>

        {product.seller?.isStudentVerified && (
          <span className="badge-success !w-fit !px-1.5 !py-0.5 !text-[0.625rem]">
            <BadgeCheck className="h-3 w-3" aria-hidden="true" />
            Verified Rungta Student
          </span>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-1.5 text-[0.65rem] text-text-muted">
          <span className="min-w-0 truncate">{product.seller?.name}</span>
          <span className="shrink-0">{formatRelativeTime(product.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
