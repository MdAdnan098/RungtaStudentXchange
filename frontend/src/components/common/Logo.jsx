import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

/**
 * Shared mark + wordmark, used in both the Navbar and Footer so the
 * brand only needs to be defined once. `size` controls icon/text
 * scale without callers needing to know the exact classes.
 */
const Logo = ({ size = "md", className }) => {
  const isSmall = size === "sm";

  return (
    <Link
      to="/"
      className={cn(
        "inline-flex items-center gap-2 font-display font-bold text-text",
        "rounded-sm transition-colors duration-base ease-standard hover:text-primary",
        className
      )}
      aria-label="RungtaStudentXchange — go to homepage"
    >
      <img
        src="/rungta-logo.png"
        alt="Rungta"
        className={cn(
          "object-contain shrink-0",
          isSmall ? "h-7 w-7" : "h-9 w-9"
        )}
      />
      <span className={isSmall ? "text-body-sm" : "text-body-lg"}>
        RungtaStudentXchange
      </span>
    </Link>
  );
};

export default Logo;