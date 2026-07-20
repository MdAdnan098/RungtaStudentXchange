import { cn } from "@/utils/cn";

const SIZE_CLASSES = {
  xs: "h-3.5 w-3.5 border-[1.5px]",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
  xl: "h-11 w-11 border-[3px]",
};

/**
 * The one shared loading indicator for the whole app — a perfectly
 * round, continuously-rotating ring. Used inline next to button text
 * (size="sm"/"xs") and centered for page/section-level loading
 * (size="lg"/"xl", usually via <PageLoader> below).
 *
 * Pure CSS (border-spin), not an icon import — this keeps it
 * dependency-free and guarantees the exact same shape everywhere
 * it's used. It has no hardcoded color: `border-current` means the
 * ring uses whatever `text-*` color the parent already sets (e.g.
 * text-inverse inside a filled btn-primary, text-primary standalone),
 * so it automatically matches the existing design tokens in both
 * light and dark mode without needing its own color prop.
 */
const LoadingSpinner = ({ size = "sm", className, label = "Loading" }) => (
  <span
    role="status"
    aria-label={label}
    className={cn(
      "inline-block shrink-0 animate-spin rounded-full border-current border-t-transparent align-middle",
      SIZE_CLASSES[size] || SIZE_CLASSES.sm,
      className
    )}
  >
    <span className="sr-only">{label}</span>
  </span>
);

/**
 * Centered, page/section-level wrapper around LoadingSpinner —
 * consistent spacing (py-16) so swapping it in for whatever a page
 * was previously showing doesn't need each call site to reinvent
 * centering/padding. `minHeight` lets a caller reserve the same
 * vertical space the loaded content will occupy, to avoid a layout
 * jump once data arrives.
 */
export const PageLoader = ({ label = "Loading…", className, minHeight }) => (
  <div
    className={cn("flex w-full items-center justify-center py-16 text-text-muted", className)}
    style={minHeight ? { minHeight } : undefined}
    role="status"
    aria-live="polite"
  >
    <LoadingSpinner size="lg" label={label} />
  </div>
);

export default LoadingSpinner;
