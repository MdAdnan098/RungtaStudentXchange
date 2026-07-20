import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Heart, Share2, Flag, MessageCircle, Phone, Pencil, Trash2 } from "lucide-react";
import { buildWhatsappLink } from "@/utils/buildWhatsappLink";
import { cn } from "@/utils/cn";

/**
 * "Show owner actions only for the owner" / "seller actions only for
 * other users" — the two groups below never both render for the same
 * viewer. Share is the one action available to everyone, owner
 * included (sharing your own listing is normal).
 *
 * The in-app chat system has been removed. "Contact Seller" now opens
 * a WhatsApp chat directly with the number the seller provided at
 * listing time. If the seller also gave an alternate number, a Call
 * button appears next to it as a fallback for when WhatsApp doesn't
 * work out.
 */
const ProductActions = ({ product, isOwner, isWishlisted, onToggleWishlist, onReport, onDelete }) => {
  const whatsappLink = buildWhatsappLink(product.whatsappNumber, product.title);

  const handleShare = async () => {
    const shareData = { title: product.title, text: product.title, url: window.location.href };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the share sheet — not an error worth surfacing.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {!isOwner && (
        <button
          type="button"
          onClick={() => onToggleWishlist(product._id)}
          aria-pressed={isWishlisted}
          className="btn-secondary flex-1 !rounded-xl btn-tactile hover:shadow-sm sm:flex-none"
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-danger text-danger")} aria-hidden="true" />
          {isWishlisted ? "Wishlisted" : "Wishlist"}
        </button>
      )}

      {!isOwner && whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex-1 !rounded-xl shadow-sm btn-tactile hover:shadow-md sm:flex-none"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Contact on WhatsApp
        </a>
      )}

      {!isOwner && product.alternateNumber && (
        <a
          href={`tel:${product.alternateNumber}`}
          className="btn-secondary flex-1 !rounded-xl btn-tactile hover:shadow-sm sm:flex-none"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          Call Seller
        </a>
      )}

      <button
        type="button"
        onClick={handleShare}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-text-secondary btn-tactile-icon hover:bg-surface-hover hover:text-text"
        aria-label="Share this listing"
      >
        <Share2 className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
      </button>

      {!isOwner && (
        <button
          type="button"
          onClick={onReport}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-text-secondary btn-tactile-icon hover:bg-danger-subtle hover:text-danger"
          aria-label="Report this listing"
        >
          <Flag className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
        </button>
      )}

      {isOwner && (
        <>
          <Link
            to={`/products/${product._id}/edit`}
            className="btn-secondary flex-1 !rounded-xl btn-tactile hover:shadow-sm sm:flex-none"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="btn-danger-ghost flex-1 !rounded-xl btn-tactile sm:flex-none"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        </>
      )}
    </div>
  );
};

export default ProductActions;
