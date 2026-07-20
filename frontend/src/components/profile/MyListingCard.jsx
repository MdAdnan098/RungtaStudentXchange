import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import ProductCard from "@/components/browse/ProductCard";
import DeleteConfirmDialog from "@/components/product/DeleteConfirmDialog";
import { updateProductStatus, deleteProduct } from "@/api/products";
import { getErrorMessage } from "@/utils/getErrorMessage";

/**
 * Reuses ProductCard exactly as built for Browse — same image,
 * badges, price, wishlist heart — rather than a second card
 * component. ProductCard has no slot for owner-only actions, and it's
 * a Browse-domain component this task shouldn't modify, so the extra
 * actions render as a bar underneath instead of inside it.
 *
 * Reuses DeleteConfirmDialog exactly as built for Product Details
 * (Task 8) — its copy ("Delete this listing? ... permanently
 * removed") was already generic, not page-specific.
 */
const MyListingCard = ({ product, wishlistedIds, onToggleWishlist, onStatusChange, onDeleted }) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isRemoved = product.status === "removed";
  const nextStatus = product.status === "active" ? "sold" : "active";

  const handleToggleStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      const response = await updateProductStatus(product._id, nextStatus);
      onStatusChange(product._id, { status: response.data.data.product.status });
      toast.success(response.data.message || "Availability updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't update availability"));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteProduct(product._id);
      toast.success(response.data.message || "Listing deleted");
      onDeleted(product._id);
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't delete this listing"));
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <ProductCard
        product={product}
        isWishlisted={wishlistedIds.has(product._id)}
        onToggleWishlist={onToggleWishlist}
        showStatusBadge
      />

      <div className="flex items-center gap-2">
        <Link to={`/products/${product._id}/edit`} className="btn-secondary btn-sm min-w-0 flex-1 py-2">
          <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">Edit</span>
        </Link>

        {!isRemoved && (
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
            className="btn-secondary btn-sm min-w-0 flex-1 py-2"
          >
            <span className="truncate">
              {isUpdatingStatus ? "Updating…" : nextStatus === "sold" ? "Mark Sold" : "Mark Available"}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors duration-base ease-standard hover:bg-danger-subtle hover:text-danger active:bg-danger-subtle"
          aria-label="Delete listing"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default MyListingCard;
