import { cn } from "@/utils/cn";

// Horizontal max-widths pages can opt into. "xl" (80rem/1280px) is the
// default — a comfortable content width that matches most listing /
// dashboard pages. Chat-style or narrow-form pages can ask for
// something tighter/wider without redefining padding themselves.
const MAX_WIDTHS = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

/**
 * Horizontal rhythm for a page: centers content, caps its width, and
 * applies consistent responsive side padding. Use this once per page
 * (or per full-bleed section that needs its content constrained)
 * instead of repeating `mx-auto max-w-* px-4 sm:px-6 lg:px-8` inline.
 */
export const PageContainer = ({ as: Tag = "div", size = "xl", className, children, ...props }) => {
  return (
    <Tag className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", MAX_WIDTHS[size], className)} {...props}>
      {children}
    </Tag>
  );
};

// Vertical rhythm between major page sections. Keeps top/bottom
// breathing room consistent without every page picking its own py-*.
const SECTION_SPACING = {
  sm: "py-6 md:py-8",
  md: "py-10 md:py-12",
  lg: "py-14 md:py-20",
};

export const Section = ({ as: Tag = "section", spacing = "md", className, children, ...props }) => {
  return (
    <Tag className={cn(SECTION_SPACING[spacing], className)} {...props}>
      {children}
    </Tag>
  );
};

export default PageContainer;
