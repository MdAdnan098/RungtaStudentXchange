import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AlertTriangle, Lock, SearchX, SquarePen } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import EmptyState from "@/components/common/EmptyState";
import ProductForm from "@/components/product-form/ProductForm";
import AvailabilityField from "@/components/product-form/AvailabilityField";
import { useProductDetails } from "@/hooks/useProductDetails";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuthStore } from "@/store/authStore";

/**
 * Reuses useProductDetails as-is (built for Product Details in Task
 * 8) rather than a second "fetch one product" hook — same
 * AbortController-cancel-on-change behavior, same loading/error/404
 * shape, so this page's early-return branches mirror
 * ProductDetails.jsx's.
 */
const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { product, isLoading, isError, isNotFound, errorMessage, refetch } = useProductDetails(id);
  const [status, setStatus] = useState(null);

  usePageTitle(product?.title ? `Edit "${product.title}"` : "Edit Listing");

  if (isLoading) {
    return (
      <Section spacing="md">
        <PageContainer size="md">
          <div className="animate-pulse space-y-6" aria-busy="true">
            <div className="flex items-center gap-3">
              <div className="hidden h-11 w-11 shrink-0 rounded-xl bg-background-subtle sm:block" />
              <div className="space-y-2">
                <div className="h-7 w-48 rounded bg-background-subtle" />
                <div className="h-4 w-64 rounded bg-background-subtle" />
              </div>
            </div>
            <div className="h-24 w-full rounded-xl bg-background-subtle" />
            <div className="h-56 w-full rounded-xl bg-background-subtle" />
            <div className="h-40 w-full rounded-xl bg-background-subtle" />
            <div className="h-32 w-full rounded-xl bg-background-subtle" />
          </div>
        </PageContainer>
      </Section>
    );
  }

  if (isNotFound) {
    return (
      <Section spacing="lg">
        <PageContainer size="sm">
          <EmptyState
            icon={SearchX}
            title="Listing not found"
            description="This product doesn't exist, or may have already been removed."
            action={
              <Link to="/browse" className="btn-primary btn-sm">
                Back to marketplace
              </Link>
            }
          />
        </PageContainer>
      </Section>
    );
  }

  if (isError) {
    return (
      <Section spacing="lg">
        <PageContainer size="sm">
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load this listing"
            description={errorMessage}
            action={
              <button type="button" onClick={refetch} className="btn-primary btn-sm">
                Retry
              </button>
            }
          />
        </PageContainer>
      </Section>
    );
  }

  const isOwner = Boolean(user && product.seller && user._id === product.seller._id);
  const isAdmin = user?.role === "admin";

  if (!isOwner && !isAdmin) {
    return (
      <Section spacing="lg">
        <PageContainer size="sm">
          <EmptyState
            icon={Lock}
            title="You can't edit this listing"
            description="Only the seller who created this listing can make changes to it."
            action={
              <Link to={`/products/${id}`} className="btn-primary btn-sm">
                View listing
              </Link>
            }
          />
        </PageContainer>
      </Section>
    );
  }

  return (
    <Section spacing="md">
      <PageContainer size="md">
        <div className="flex items-start gap-3">
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary-subtle-text sm:flex">
            <SquarePen className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-h2">Edit listing</h1>
            <p className="mt-1.5 text-body-sm text-text-muted">Update your listing's details or photos.</p>
          </div>
        </div>

        <div className="mt-6">
          <AvailabilityField productId={product._id} status={status || product.status} onStatusChange={setStatus} />

          <ProductForm
            mode="edit"
            product={product}
            onSuccess={(updatedProduct) => navigate(`/products/${updatedProduct._id}`, { replace: true })}
          />
        </div>
      </PageContainer>
    </Section>
  );
};

export default EditListing;
