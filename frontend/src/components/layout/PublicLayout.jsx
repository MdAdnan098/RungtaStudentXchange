import { Outlet } from "react-router-dom";

/**
 * Shell for routes anyone can visit (currently just Home). Login,
 * Register, and the password-reset pages also render under this
 * layout for a consistent shell, but are additionally wrapped in
 * <GuestRoute /> (see routes/GuestRoute.jsx) which redirects an
 * already-authenticated user back to "/" — that redirect logic lives
 * there, not here, since it shouldn't apply to Home itself.
 *
 * Currently a pass-through otherwise — Navbar/Footer already come
 * from AppLayout one level up.
 *
 * No <PageContainer> wrapper here on purpose: public pages are the
 * most likely to want full-bleed hero sections, so width/spacing is
 * left to each page to decide per-section.
 */
const PublicLayout = () => {
  return <Outlet />;
};

export default PublicLayout;
