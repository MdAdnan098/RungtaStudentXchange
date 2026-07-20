import { Outlet } from "react-router-dom";

/**
 * Visual shell for logged-in pages (dashboard, profile, wishlist,
 * chat, ...). Deliberately separate from src/routes/ProtectedRoute.jsx:
 * that component owns *access control* (redirect to /login if not
 * authenticated), this one owns *layout*. Composed together in
 * AppRoutes.jsx as:
 *
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<ProtectedLayout />}>
 *       <Route path="/dashboard" element={<Dashboard />} />
 *     </Route>
 *   </Route>
 *
 * A pass-through, like PublicLayout — every route rendered under this
 * layout (Dashboard, Profile, Edit Profile, My Listings, Settings,
 * Wishlist, Create/Edit Listing) already wraps itself in its own
 * <Section>/<PageContainer> for width, padding, and vertical rhythm.
 * Wrapping the <Outlet /> in a second PageContainer here used to
 * double up that horizontal padding (cramping content on small
 * screens) and stack a second layer of vertical padding on top of
 * each page's own spacing, which made protected pages noticeably
 * tighter/unevenly spaced compared to public pages (Home, Browse,
 * Product Details) using the exact same Section/PageContainer
 * pattern just once.
 */
const ProtectedLayout = () => {
  return <Outlet />;
};

export default ProtectedLayout;
