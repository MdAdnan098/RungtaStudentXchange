import { useNavigate } from "react-router-dom";
import { PackagePlus } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import CreateListingForm from "@/components/product-form/CreateListingForm";
import { usePageTitle } from "@/hooks/usePageTitle";

const CreateListing = () => {
  usePageTitle("Create a Listing");

  const navigate = useNavigate();

  return (
    <Section spacing="md">
      <PageContainer size="md">
        <div className="flex items-start gap-3">
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary-subtle-text sm:flex">
            <PackagePlus className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-h2">Create a listing</h1>
            <p className="mt-1.5 text-body-sm text-text-muted">
              Add photos and details so fellow students can find your item.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <CreateListingForm onSuccess={(product) => navigate(`/products/${product._id}`, { replace: true })} />
        </div>
      </PageContainer>
    </Section>
  );
};

export default CreateListing;
