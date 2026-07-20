import { useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { X, LogIn, UserPlus, User, LayoutDashboard, PlusCircle, ShieldCheck, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import ThemeToggle from "@/components/common/ThemeToggle";
import { MAIN_NAV_LINKS } from "@/constants/navigation";
import { cn } from "@/utils/cn";

/**
 * Off-canvas navigation drawer — a compact, rounded panel anchored to
 * the top-right of the screen (matching the hamburger's position in
 * Navbar), not a full-screen or centered modal. It sizes itself to
 * its content instead of stretching to the viewport edges, which is
 * what gives it the "floating card" feel of a premium mobile nav
 * rather than a generic full-height sidebar. Shell logic (Escape,
 * Tab-trap, body scroll lock, outside-click-to-close) reuses the same
 * useFocusTrap hook as every other overlay in the app.
 */
const MobileNav = ({ isOpen, onClose }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);

  useFocusTrap({ isOpen, onClose, containerRef: panelRef, initialFocusRef: closeButtonRef });

  const handleLogout = () => {
    onClose();
    logout();
    navigate("/");
  };

  // Wishlist only makes sense once someone's signed in — guests see
  // just Home + Browse here, matching the desktop nav's own guarded
  // routes.
  const visibleMainLinks = MAIN_NAV_LINKS.filter((link) => link.path !== "/wishlist" || isAuthenticated);

  const itemClasses = ({ isActive } = {}) =>
    cn(
      "flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-body font-medium",
      "transition-colors duration-base ease-standard",
      isActive
        ? "bg-primary-subtle text-primary-subtle-text"
        : "text-text-secondary hover:bg-surface-hover hover:text-text"
    );

  return (
    <div
      aria-hidden={!isOpen}
      className={cn("fixed inset-0 z-modal md:hidden", isOpen ? "" : "pointer-events-none")}
    >
      {/* Backdrop — semi-transparent scrim behind the drawer. Tapping
         anywhere on it (i.e. outside the drawer) closes the menu. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-gray-950/60 backdrop-blur-[2px] transition-opacity duration-base ease-standard",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Panel — a self-sizing rounded card, not a full-height sheet.
         Anchored top-right with a small margin on every side; height
         hugs its content (capped + scrollable as a safety net on very
         short viewports) instead of stretching to the bottom edge. */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={cn(
          "absolute right-4 top-4 flex max-h-[calc(100vh-2rem)] w-[82%] max-w-sm flex-col",
          "rounded-2xl border border-border bg-surface-raised shadow-xl dark:shadow-drawer-dark",
          "transition-transform duration-slow ease-emphasized will-change-transform",
          isOpen ? "translate-x-0" : "translate-x-[120%]"
        )}
      >
        {/* Close button sits top-right inside the drawer; no "Menu"
           heading — nav items begin directly below it. */}
        <div className="flex items-center justify-end px-4 pt-4">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text transition-colors duration-base ease-standard"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto px-4 pb-6 pt-1">
          <ul className="space-y-1">
            {visibleMainLinks.map(({ label, path, icon: Icon }) => (
              <li key={path}>
                <NavLink to={path} onClick={onClose} className={itemClasses}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="divider my-3" />

          {isAuthenticated ? (
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/sell"
                  onClick={onClose}
                  className="flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-body font-medium text-primary hover:bg-primary-subtle transition-colors duration-base ease-standard"
                >
                  <PlusCircle className="h-5 w-5" aria-hidden="true" />
                  Create Listing
                </NavLink>
              </li>
              {user?.role === "admin" && (
                <li>
                  <NavLink to="/admin" onClick={onClose} className={itemClasses}>
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                    Admin Dashboard
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink to="/dashboard" onClick={onClose} className={itemClasses}>
                  <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" onClick={onClose} className={itemClasses}>
                  <User className="h-5 w-5" aria-hidden="true" />
                  Profile
                </NavLink>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-body font-medium text-danger-text hover:bg-danger-subtle transition-colors duration-base ease-standard"
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  Logout
                </button>
              </li>
            </ul>
          ) : (
            <ul className="space-y-1">
              <li>
                <NavLink to="/login" onClick={onClose} className={itemClasses}>
                  <LogIn className="h-5 w-5" aria-hidden="true" />
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/register"
                  onClick={onClose}
                  className="flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-body font-medium text-primary hover:bg-primary-subtle transition-colors duration-base ease-standard"
                >
                  <UserPlus className="h-5 w-5" aria-hidden="true" />
                  Register
                </NavLink>
              </li>
            </ul>
          )}

          <div className="divider my-3" />

          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-caption text-text-muted">Theme</span>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileNav;
