import { Users, Package, PackageCheck, Flag, BadgeCheck, AlertTriangle } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import AdminNav from "@/components/admin/AdminNav";
import AdminStatCard from "@/components/admin/AdminStatCard";
import EmptyState from "@/components/common/EmptyState";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const StatSkeleton = () => (
  <div className="card-padded flex items-center gap-3" aria-hidden="true">
    <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-background-subtle" />
    <div className="space-y-2">
      <div className="h-6 w-12 animate-pulse rounded bg-background-subtle" />
      <div className="h-3 w-16 animate-pulse rounded bg-background-subtle" />
    </div>
  </div>
);

/**
 * Every number here comes directly from GET /admin/stats
 * (adminController.js getDashboardStats: totalUsers, totalListings,
 * activeListings, pendingReports, verifiedStudents) — no client-side
 * derivation, since the backend already computes these.
 */
const AdminDashboard = () => {
  const { stats, isLoading, isError, errorMessage, refetch } = useDashboardStats();

  return (
    <Section spacing="md">
      <PageContainer>
        <h1 className="text-h2 mb-4">Admin Dashboard</h1>
        <AdminNav />

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-busy="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <StatSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load dashboard statistics"
            description={errorMessage}
            action={
              <button type="button" onClick={refetch} className="btn-primary btn-sm">
                Retry
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <AdminStatCard icon={Users} label="Total Users" value={stats.totalUsers} />
            <AdminStatCard icon={Package} label="Total Listings" value={stats.totalListings} />
            <AdminStatCard icon={PackageCheck} label="Active Listings" value={stats.activeListings} />
            <AdminStatCard icon={Flag} label="Pending Reports" value={stats.pendingReports} />
            <AdminStatCard icon={BadgeCheck} label="Verified Students" value={stats.verifiedStudents} />
          </div>
        )}
      </PageContainer>
    </Section>
  );
};

export default AdminDashboard;
