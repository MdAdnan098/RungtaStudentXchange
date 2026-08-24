import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Package, Settings as SettingsIcon } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { getMe } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { usePageTitle } from "@/hooks/usePageTitle";

/**
 * Refetches via GET /auth/me once on mount rather than trusting only
 * the persisted authStore copy — that copy can go stale (e.g. bio/
 * avatar changed in another tab/device). Uses setUser (already on
 * authStore) to write the fresh copy back, so every other place that
 * reads the user (Navbar, etc.) benefits too. No new store: this is
 * exactly what authStore already exists for.
 *
 * "My Listings" is hidden for admin accounts — admins don't create
 * marketplace listings, so the link has nothing to show them.
 */
const Profile = () => {
  usePageTitle("Your Profile");

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getMe({ signal: controller.signal })
      .then((response) => setUser(response.data.data.user))
      .catch(() => {
        // Keep showing the cached copy — a failed refresh shouldn't
        // blank out a profile the user can already see.
      })
      .finally(() => setIsRefreshing(false));
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null; // ProtectedRoute guarantees this shouldn't happen

  const isAdmin = user.role === "admin";

  return (
    <Section spacing="md">
      <PageContainer size="md">
        <div aria-busy={isRefreshing}>
          <ProfileHeader user={user} />
        </div>

        <div className="mt-6 space-y-3">
          <Link to="/profile/edit" className="btn-secondary w-full justify-center py-3">
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit Profile Info/Password
          </Link>
          <div className={isAdmin ? "grid grid-cols-1 gap-3 sm:gap-4" : "grid grid-cols-2 gap-3 sm:gap-4"}>
            {!isAdmin && (
              <Link to="/profile/listings" className="btn-secondary justify-center py-3">
                <Package className="h-4 w-4" aria-hidden="true" />
                My Listings
              </Link>
            )}
            <Link to="/settings" className="btn-secondary justify-center py-3">
              <SettingsIcon className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
          </div>
        </div>
      </PageContainer>
    </Section>
  );
};

export default Profile;