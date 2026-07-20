import { Home, Search, Heart } from "lucide-react";

/**
 * Single source of truth for the main nav links, so Navbar,
 * MobileNav, and Footer's "Quick Links" never drift out of sync.
 *
 * `icon` is a component reference (not JSX) — safe to keep in a plain
 * constants file, it's only rendered where it's used (e.g. `<icon />`).
 */
export const MAIN_NAV_LINKS = [
  { label: "Home", path: "/", icon: Home },
  { label: "Browse", path: "/browse", icon: Search },
  { label: "Wishlist", path: "/wishlist", icon: Heart },
];
