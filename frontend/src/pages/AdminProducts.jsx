import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, PackageX, Pencil } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import AdminNav from "@/components/admin/AdminNav";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import DeleteProductDialog from "@/components/admin/DeleteProductDialog";
import DeleteAllDialog from "@/components/admin/DeleteAllDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/browse/Pagination";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { deleteProductPermanently, deleteAllProducts } from "@/api/admin";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { formatPrice } from "@/utils/formatPrice";
import { CATEGORIES, PRODUCT_STATUS } from "@/constants";
import { STATUS_BADGE_CLASS } from "@/constants/statusBadges";

/**
 * "Restore" and other status updates beyond delete were listed as
 * example actions in the brief, but adminRoutes.js only exposes
 * PATCH /admin/products/:id/remove and DELETE /admin/products/:id —
 * no admin-side restore or arbitrary status endpoint. Only Delete is
 * offered here; see the final summary's backend limitations.
 */
const AdminProducts = () => {
  const {
    products,
    total,
    limit,
    filters,
    setFilter,
    isLoading,
    isError,
    errorMessage,
    refetch,
    removeProductLocally,
  } = useAdminProducts();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteProductPermanently(deleteTarget._id);
      removeProductLocally(deleteTarget._id);
      toast.success(response.data.message || "Listing deleted");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't delete this listing"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      const response = await deleteAllProducts();
      toast.success(response.data.message || "All listings deleted");
      setIsDeleteAllOpen(false);
      refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't delete all listings"));
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <Section spacing="md">
      <PageContainer>
        <h1 className="text-h2 mb-4">Admin Dashboard</h1>
        <AdminNav />

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsDeleteAllOpen(true)}
            disabled={isDeletingAll}
            className="btn-danger-ghost btn-sm inline-flex items-center gap-2"
          >
            {isDeletingAll && <LoadingSpinner size="xs" />}
            Delete All Listings
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <AdminSearchInput
              id="admin-product-search"
              label="Search listings"
              placeholder="Search by title or description…"
              value={filters.search}
              onChange={(value) => setFilter("search", value)}
            />
          </div>
          <select
            className="select w-full sm:w-40"
            value={filters.status}
            onChange={(event) => setFilter("status", event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {PRODUCT_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            className="select w-full sm:w-44"
            value={filters.category}
            onChange={(event) => setFilter("category", event.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-lg bg-background-subtle" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load listings"
            description={errorMessage}
            action={
              <button type="button" onClick={refetch} className="btn-primary btn-sm">
                Retry
              </button>
            }
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title="No listings found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-body-sm">
              <caption className="sr-only">All product listings</caption>
              <thead className="bg-background-subtle text-caption uppercase text-text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Listing
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Seller
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Price
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-4 py-3">
                      <Link
                        to={`/products/${product._id}`}
                        className="font-medium text-text hover:text-primary transition-colors duration-base ease-standard"
                      >
                        {product.title}
                      </Link>
                      <span className="block text-caption text-text-muted">{product.category}</span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      <span className="block">{product.seller?.name || "Deleted user"}</span>
                      <span className="block text-caption">
                        {product.seller?.email}
                        {product.seller?.isBanned && <span className="text-danger-text"> · banned</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <span className={STATUS_BADGE_CLASS[product.status] || "badge-neutral"}>{product.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link to={`/products/${product._id}/edit`} className="btn-ghost btn-sm" title="Edit listing">
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                        {product.status !== "removed" && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            className="btn-danger-ghost btn-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && (
          <Pagination
            page={filters.page}
            limit={limit}
            total={total}
            onPageChange={(page) => setFilter("page", page)}
          />
        )}
      </PageContainer>

      <DeleteProductDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        productTitle={deleteTarget?.title || ""}
        isSubmitting={isDeleting}
      />
      <DeleteAllDialog
        isOpen={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        onConfirm={handleDeleteAll}
        title="Delete all listings?"
        description="Are you sure you want to delete ALL listings? This action cannot be undone."
        confirmLabel="Delete All Listings"
        isSubmitting={isDeletingAll}
      />
    </Section>
  );
};

export default AdminProducts;
