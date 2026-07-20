import { Clock, MapPin } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { CONDITION_BADGE_CLASS } from "@/constants/conditionBadges";

// Product.status ("active" | "sold" | "removed") is the closest thing
// the backend has to "availability" — there's no separate
// availability field. Unlike getAllProducts (which filters
// status:"active"), getProductById applies NO status filter at all —
// a "removed" or "sold" product stays fully reachable by direct URL.
// ProductDetails.jsx handles the "removed" case with its own
// dedicated empty state for non-owners; "sold" still renders normally
// here (a sold listing is still meaningful to view), just badged.
const AVAILABILITY_LABEL = {
  active: { label: "Available", className: "badge-success" },
  sold: { label: "Sold", className: "badge-neutral" },
  removed: { label: "Removed", className: "badge-danger" },
};

const ProductInfoPanel = ({ product, children }) => {
  const availability = AVAILABILITY_LABEL[product.status] || AVAILABILITY_LABEL.active;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge-neutral">{product.category}</span>
        <span className={CONDITION_BADGE_CLASS[product.condition] || "badge-neutral"}>{product.condition}</span>
        <span className={availability.className}>{availability.label}</span>
      </div>

      <h1 className="text-balance text-h1">{product.title}</h1>

      <div className="flex flex-wrap items-center gap-2">
        <p className="font-display text-h2 tracking-tight text-text tabular-nums">{formatPrice(product.price)}</p>
        {product.negotiable && <span className="badge-accent">Negotiable</span>}
      </div>

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-text-muted">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          Posted {formatRelativeTime(product.createdAt)}
        </span>
        {product.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {product.location}
          </span>
        )}
      </p>

      {children}
    </div>
  );
};

export default ProductInfoPanel;
