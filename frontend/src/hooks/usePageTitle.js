import { useEffect } from "react";

const SITE_NAME = "RungtaStudentXchange";

/**
 * Sets document.title for the current page. In a single-page app the
 * browser tab title never changes on its own when the route changes
 * (there's no full page load) — without this, every route shows the
 * same generic title from index.html forever. That's a real
 * screen-reader issue too: assistive tech announces the document
 * title on route change as the primary cue that navigation actually
 * happened, so a static title makes every page transition silent.
 *
 * Pass just the page-specific part (e.g. "Browse Marketplace") — the
 * site name is appended automatically. Restores the previous title on
 * unmount so a page that mounts briefly (e.g. during a redirect)
 * doesn't leave a stale title behind.
 */
export const usePageTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
