import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router doesn't reset scroll position on navigation the way a
 * normal multi-page site does — clicking from the bottom of Browse
 * into a Product Details page currently lands the reader wherever
 * that new page happens to be tall enough to still show the old
 * scroll offset, which reads as broken rather than just unpolished.
 * This mounts once at the root (see App.jsx) and scrolls to top on
 * every pathname change.
 *
 * Deliberately keyed on `pathname` only, not the full location: pages
 * like Browse encode filters/page/search in the query string via the
 * same pathname, and those shouldn't yank the reader to the top of
 * the page on every keystroke — Browse's own pagination handles its
 * own scroll behavior for that case.
 *
 * Uses `behavior: "auto"`, which follows the `<html>` element's CSS
 * `scroll-behavior` — smooth by default, collapsed to instant by the
 * existing `prefers-reduced-motion` rule in styles/index.css. No
 * separate reduced-motion check needed here; it inherits the same
 * rule every other scroll/animation in the app already respects.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
