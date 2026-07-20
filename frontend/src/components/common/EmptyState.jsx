import { cn } from "@/utils/cn";

/**
 * Generic empty state: icon + title + description + optional action.
 * Built for Recent Listings on the landing page, but deliberately
 * generic (no landing-specific copy baked in) so Browse, Wishlist,
 * and Chat can reuse it once those modules exist instead of each
 * inventing their own "nothing here" treatment.
 */
const EmptyState = ({ icon: Icon, title, description, action, className }) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-16",
        className
      )}
    >
      {Icon && (
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-background-subtle text-text-muted">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <p className="text-h5 text-text">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-body-sm text-text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
