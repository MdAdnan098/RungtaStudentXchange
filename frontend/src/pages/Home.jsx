import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FreshListingsSection from "@/components/home/FreshListingsSection";
import CommunitySection from "@/components/home/CommunitySection";
import CTASection from "@/components/home/CTASection";
import LocationConsentDialog from "@/components/common/LocationConsentDialog";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

/**
 * Landing page only. Each section is its own component under
 * components/home/ — this file is purely composition/order, no
 * markup of its own, so reordering or removing a section later is a
 * one-line change here.
 *
 * useVisitorTracking + LocationConsentDialog implement Visitor
 * Analytics' visit-tracking flow (see hooks/useVisitorTracking.js) —
 * intentionally mounted only here, not in AppLayout, since the spec
 * is "first landing-page visit per session", not every page.
 */
const Home = () => {
  usePageTitle("Buy & Sell on Campus");
  const { isDialogOpen, handleAllow, handleNotNow } = useVisitorTracking();

  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FreshListingsSection />
      <CommunitySection />
      <CTASection />
      <LocationConsentDialog isOpen={isDialogOpen} onAllow={handleAllow} onNotNow={handleNotNow} />
    </>
  );
};

export default Home;
