import { Link } from "react-router-dom";
import { ArrowUpRight, HeartOff } from "lucide-react";
import ProductCard from "@/components/browse/ProductCard";

/**
 * Reuses ProductCard exactly as built for Browse (same image, badges,
 * price, wishlist heart) rather than a second card component — same
 * reasoning as MyListingCard. The heart on the image still works as
 * a quick remove (it already means "wishlisted, click to unwishlist"
 * everywhere else in the app); this just adds an explicit action row
 * underneath for people who want obvious buttons instead.
 *
 * No confirm dialog on Remove: unlike deleting a listing, removing a
 * wishlist save is instant and trivially reversible (re-wishlist from
 * Browse/Product Details), matching the existing heart-toggle
 * behavior this reuses under the hood (useWishlist().toggle).
 */
const WishlistCard = ({ product, onRemove }) => {
  return (
    <div className="flex flex-col gap-2.5">
      <ProductCard product={product} isWishlisted onToggleWishlist={onRemove} />

      <div className="flex items-center gap-2">
        <Link to={`/products/${product._id}`} className="btn-secondary btn-sm min-w-0 flex-1 py-2">
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">View Details</span>
        </Link>

        <button
          type="button"
          onClick={() => onRemove(product._id)}
          className="btn-danger-ghost btn-sm min-w-0 flex-1 py-2"
        >
          <HeartOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">Remove</span>
        </button>
      </div>
    </div>
  );
};

export default WishlistCard;
