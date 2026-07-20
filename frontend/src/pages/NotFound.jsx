import { Link } from "react-router-dom";
import { Compass, Home as HomeIcon } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import { usePageTitle } from "@/hooks/usePageTitle";

/**
 * Route-level fallback for `path="*"` in AppRoutes. Was previously an
 * unstyled placeholder div — replaced with a real page using the same
 * PageContainer/Section primitives and btn-* classes as the rest of
 * the app so it doesn't look broken when a student lands here from a
 * stale/shared link.
 */
const NotFound = () => {
  usePageTitle("Page Not Found");

  return (
    <Section spacing="lg">
      <PageContainer size="sm">
        <div className="flex flex-col items-center text-center">
          <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-background-subtle text-text-muted">
            <Compass className="h-7 w-7" aria-hidden="true" />
          </span>
          <p className="text-body-sm font-semibold uppercase tracking-wide text-primary">404</p>
          <h1 className="mt-2 text-h3 text-text">Page not found</h1>
          <p className="mt-2 max-w-sm text-body-sm text-text-muted">
            The page you're looking for doesn't exist, or may have been moved.
          </p>
          <div className="mt-6 flex flex-col gap-3 xs:flex-row">
            <Link to="/" className="btn-primary">
              <HomeIcon className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Link>
            <Link to="/browse" className="btn-secondary">
              Browse Marketplace
            </Link>
          </div>
        </div>
      </PageContainer>
    </Section>
  );
};

export default NotFound;
