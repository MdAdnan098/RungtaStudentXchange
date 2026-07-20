import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/**
 * The single outer shell for the entire site: Navbar + routed content
 * + Footer. Mounted once at the root of the route tree (see
 * AppRoutes.jsx) so it never remounts on navigation — only <Outlet />
 * swaps.
 *
 * Deliberately has no max-width/padding of its own around <Outlet />:
 * some pages (a hero section, a full-bleed banner) want to touch the
 * viewport edges, others want a constrained column. Individual pages
 * and the layouts below use <PageContainer> for that, per-section.
 */
const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Visually hidden until focused — lets keyboard and screen-reader
         users jump straight past the navbar's ~10 tab stops into the
         page content, instead of tabbing through the same nav on every
         single page before reaching anything new. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-toast focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-body-sm focus:font-medium focus:text-text-inverse focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
