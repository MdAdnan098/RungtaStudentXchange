import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, User, ShieldCheck, ChevronDown, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/components/common/Logo";
import ThemeToggle from "@/components/common/ThemeToggle";
import MobileNav from "@/components/layout/MobileNav";
import NotificationBell from "@/components/layout/NotificationBell";
import PageContainer from "@/components/layout/PageContainer";
import { MAIN_NAV_LINKS } from "@/constants/navigation";
import { cn } from "@/utils/cn";

const navLinkClasses = ({ isActive }) =>
  cn(
    "px-3 py-2 rounded-lg text-body-sm font-medium transition-colors duration-base ease-standard",
    isActive ? "text-primary bg-primary-subtle" : "text-text-secondary hover:text-text hover:bg-surface-hover"
  );

/**
 * Auth-aware avatar dropdown. Fully keyboard operable: button toggles
 * with aria-expanded, Escape and outside-click close it.
 */
const AvatarMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const goToProfile = () => {
    setIsOpen(false);
    navigate("/profile");
  };

  const goToSettings = () => {
    setIsOpen(false);
    navigate("/settings");
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-1.5 rounded-full p-1 pr-2 hover:bg-surface-hover transition-colors duration-base ease-standard"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open account menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-subtle text-primary-subtle-text text-body-sm font-display font-semibold">
          {initial}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-text-muted transition-transform duration-base ease-standard", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Account"
          className="popover-panel absolute right-0 mt-2 w-56 origin-top-right"
        >
          <div className="px-3 py-2">
            <p className="text-body-sm font-medium text-text truncate">{user?.name || "Student"}</p>
            <p className="text-caption text-text-muted truncate">{user?.email || ""}</p>
          </div>
          <div className="divider" />
          <button type="button" role="menuitem" onClick={goToProfile} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-body-sm text-text-secondary hover:bg-surface-hover hover:text-text transition-colors duration-base ease-standard">
            <User className="h-4 w-4" aria-hidden="true" />
            Profile
          </button>
          <button type="button" role="menuitem" onClick={goToSettings} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-body-sm text-text-secondary hover:bg-surface-hover hover:text-text transition-colors duration-base ease-standard">
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </button>
          <div className="divider" />
          <button type="button" role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-body-sm text-danger-text hover:bg-danger-subtle transition-colors duration-base ease-standard">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const mobileTriggerRef = useRef(null);

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
    mobileTriggerRef.current?.focus();
  };

  return (
    <>
    <header className="sticky top-0 z-sticky border-b border-border bg-background-subtle/90 backdrop-blur-sm dark:shadow-nav-dark">
      <PageContainer>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: logo */}
          <Logo />

          {/* Center: main nav (desktop only) */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-1">
            {MAIN_NAV_LINKS.map(({ label, path }) => (
              <NavLink key={path} to={path} className={navLinkClasses}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right: auth-aware controls (desktop only) */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user?.role === "admin" && (
              <Link to="/admin" className="btn-ghost btn-sm gap-1.5">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Admin Dashboard
              </Link>
            )}

            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <NotificationBell />
                <AvatarMenu user={user} />
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary btn-sm">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile: bell (if logged in) + hamburger trigger */}
          <div className="flex items-center gap-1 md:hidden">
            {isAuthenticated && <NotificationBell />}
            <button
              ref={mobileTriggerRef}
              type="button"
              onClick={() => setIsMobileNavOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text transition-colors duration-base ease-standard"
              aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
              aria-haspopup="dialog"
              aria-expanded={isMobileNavOpen}
            >
              {isMobileNavOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </PageContainer>
    </header>

    <MobileNav isOpen={isMobileNavOpen} onClose={closeMobileNav} />
    </>
  );
};

export default Navbar;