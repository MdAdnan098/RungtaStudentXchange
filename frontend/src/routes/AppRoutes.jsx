import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AdminRoute from "@/routes/AdminRoute";
import GuestRoute from "@/routes/GuestRoute";

import AppLayout from "@/components/layout/AppLayout";
import PublicLayout from "@/components/layout/PublicLayout";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import AdminLayout from "@/components/layout/AdminLayout";

import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import ProductDetails from "@/pages/ProductDetails";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AdminLogin from "@/pages/AdminLogin";
import AdminRegister from "@/pages/AdminRegister";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import ProfileEdit from "@/pages/ProfileEdit";
import MyListings from "@/pages/MyListings";
import Settings from "@/pages/Settings";
import Wishlist from "@/pages/Wishlist";
import CreateListing from "@/pages/CreateListing";
import EditListing from "@/pages/EditListing";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminProducts from "@/pages/AdminProducts";
import AdminReports from "@/pages/AdminReports";
import AdminVisitors from "@/pages/AdminVisitors";
import NotFound from "@/pages/NotFound";

/**
 * Route tree, grouped by access level. Every route renders inside
 * <AppLayout> (Navbar + Footer, mounted once) via the outer wrapping
 * route below. Within that, access level decides which guard + shell
 * pair a page nests under:
 *
 *  - Public:      PublicLayout only — no guard, anyone can visit (Home)
 *  - Guest-only:   GuestRoute (guard) → PublicLayout shell — Login,
 *                  Register, Forgot/Reset Password redirect an already
 *                  signed-in user back to "/"
 *  - Protected:   ProtectedRoute (guard) → ProtectedLayout (shell)
 *  - Admin:       AdminRoute (guard)     → AdminLayout (shell)
 *
 * Guards (routes/*.js) own redirect logic; layouts (components/layout/*)
 * own visual shell. Keeping them separate means adding a page is just
 * one <Route> line under the right group.
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          {/* Guest-only */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
          </Route>
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/profile/listings" element={<MyListings />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/sell" element={<CreateListing />} />
            <Route path="/products/:id/edit" element={<EditListing />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/visitors" element={<AdminVisitors />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
