import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, PackageX, SearchX } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import EmptyState from "@/components/common/EmptyState";
import ImageGallery from "@/components/product/ImageGallery";
import ProductInfoPanel from "@/components/product/ProductInfoPanel";
import ProductActions from "@/components/product/ProductActions";
import SellerCard from "@/components/product/SellerCard";
import RelatedProducts from "@/components/product/RelatedProducts";
import ReportModal from "@/components/product/ReportModal";
import DeleteConfirmDialog from "@/components/product/DeleteConfirmDialog";
import ProductDetailsSkeleton from "@/components/product/ProductDetailsSkeleton";
import { useProductDetails } from "@/hooks/useProductDetails";
import { useRelatedProducts } from "@/hooks/useRelatedProducts";
import { useWishlist } from "@/hooks/useWishlist";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuthStore } from "@/store/authStore";
import { deleteProduct, incrementViewCount } from "@/api/products";
import { getErrorMessage } from "@/utils/getErrorMessage";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { product, isLoading, isError, isNotFound, errorMessage, refetch } = useProductDetails(id);
  const { relatedProducts, isLoading: isRelatedLoading } = useRelatedProducts(product?.category, product?._id);
  const { wishlistedIds, toggle } = useWishlist();
  const user = useAuthStore((state) => state.user);

  usePageTitle(product?.title || "Product Details");

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fire-and-forget, once per mount of a successfully-loaded product —
  // not tied to the fetch's own AbortController/error state, since a
  // failed view-count PATCH should never affect the page the user sees.
  useEffect(() => {
    if (product?._id) {
      incrementViewCount(product._id).catch(() => {});
    }
  }, [product?._id]);

  const isOwner = Boolean(user && product && user._id === product.seller?._id);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteProduct(product._id);
      toast.success(response.data.message || "Listing deleted");
      navigate("/browse", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't delete this listing"));
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Section spacing="md">
        <PageContainer>
          <ProductDetailsSkeleton />
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
            description="This product doesn't exist, or may have been removed by the seller."
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

  // Defensive — getProductById can still return a product whose
  // status has moved to "removed" between listing and viewing it
  // (the backend doesn't hide removed products from direct ID
  // lookups, only from the public browse/search list).
  if (product.status === "removed" && !isOwner) {
    return (
      <Section spacing="lg">
        <PageContainer size="sm">
          <EmptyState
            icon={PackageX}
            title="This listing has been removed"
            description="The seller or an admin has taken this listing down."
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

  return (
    <Section spacing="md">
      <PageContainer>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <ImageGallery images={product.images} title={product.title} />

          <ProductInfoPanel product={product}>
            {product.seller ? (
              <SellerCard seller={product.seller} />
            ) : (
              <div className="card-padded !rounded-2xl text-body-sm text-text-muted">
                This seller's account no longer exists.
              </div>
            )}
            <ProductActions
              product={product}
              isOwner={isOwner}
              isWishlisted={wishlistedIds.has(product._id)}
              onToggleWishlist={toggle}
              onReport={() => setIsReportOpen(true)}
              onDelete={() => setIsDeleteOpen(true)}
            />
          </ProductInfoPanel>
        </div>

        <section aria-labelledby="product-description-heading" className="mt-10 max-w-3xl border-t border-border pt-8">
          <h2 id="product-description-heading" className="text-h4">
            Description
          </h2>
          <p className="mt-3 whitespace-pre-line text-body text-text-secondary">{product.description}</p>
        </section>

        <RelatedProducts
          products={relatedProducts}
          isLoading={isRelatedLoading}
          wishlistedIds={wishlistedIds}
          onToggleWishlist={toggle}
        />
      </PageContainer>

      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} productId={product._id} />
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </Section>
  );
};

export default ProductDetails;
