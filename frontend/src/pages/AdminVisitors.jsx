import { useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  CalendarRange,
  Download,
  ExternalLink,
  MapPin,
  MapPinOff,
  Trash2,
  UserCheck,
  Users as UsersIcon,
  UserX,
} from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import AdminNav from "@/components/admin/AdminNav";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import VisitorMap from "@/components/admin/VisitorMap";
import DeleteVisitorDialog from "@/components/admin/DeleteVisitorDialog";
import DeleteAllDialog from "@/components/admin/DeleteAllDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/browse/Pagination";
import { useVisitorStats } from "@/hooks/useVisitorStats";
import { useVisitorMap } from "@/hooks/useVisitorMap";
import { useAdminVisitors } from "@/hooks/useAdminVisitors";
import { deleteVisitor, deleteAllVisitors, exportVisitors } from "@/api/admin";
import { exportVisitorsCsv } from "@/utils/exportVisitorsCsv";
import { getErrorMessage } from "@/utils/getErrorMessage";

const StatSkeleton = () => (
  <div className="card-padded flex items-center gap-3" aria-hidden="true">
    <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-background-subtle" />
    <div className="space-y-2">
      <div className="h-6 w-12 animate-pulse rounded bg-background-subtle" />
      <div className="h-3 w-16 animate-pulse rounded bg-background-subtle" />
    </div>
  </div>
);

const PERMISSION_BADGE = {
  granted: "badge-success",
  denied: "badge-danger",
  dismissed: "badge-neutral",
  unavailable: "badge-warning",
};

/**
 * Full Visitor Analytics module: summary cards (useVisitorStats), the
 * bubble map (useVisitorMap → VisitorMap), and the Recent Visitors
 * table (useAdminVisitors) with search/filter/pagination/CSV export/
 * delete/delete-all. Reuses every existing admin building block
 * (AdminNav, AdminStatCard, AdminSearchInput, DeleteAllDialog,
 * Pagination, LoadingSpinner, EmptyState) exactly as-is.
 */
const AdminVisitors = () => {
  const { stats, isLoading: statsLoading, isError: statsError, errorMessage: statsErrorMessage, refetch: refetchStats } =
    useVisitorStats();
  const { bubbles, isLoading: mapLoading, isError: mapError, errorMessage: mapErrorMessage } = useVisitorMap();
  const {
    visitors,
    total,
    limit,
    filters,
    setFilter,
    isLoading,
    isError,
    errorMessage,
    refetch,
    removeVisitorLocally,
  } = useAdminVisitors();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteVisitor(deleteTarget._id);
      removeVisitorLocally(deleteTarget._id);
      toast.success(response.data.message || "Visitor record deleted");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't delete this visitor record"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      const response = await deleteAllVisitors();
      toast.success(response.data.message || "All visitor records deleted");
      setIsDeleteAllOpen(false);
      refetch();
      refetchStats();
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't delete all visitor records"));
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await exportVisitors({
        search: filters.search || undefined,
        isGuest: filters.isGuest || undefined,
        permissionStatus: filters.permissionStatus || undefined,
        deviceType: filters.deviceType || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      exportVisitorsCsv(response.data.data.visitors);
      toast.success("CSV export ready");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't export visitors"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Section spacing="md">
      <PageContainer>
        <h1 className="text-h2 mb-4">Admin Dashboard</h1>
        <AdminNav />

        <h2 className="text-h4 mb-4">Visitor Analytics</h2>

        {statsLoading ? (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <StatSkeleton key={index} />
            ))}
          </div>
        ) : statsError ? (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load visitor stats"
            description={statsErrorMessage}
            action={
              <button type="button" onClick={refetchStats} className="btn-primary btn-sm">
                Retry
              </button>
            }
            className="mb-8"
          />
        ) : (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AdminStatCard icon={UsersIcon} label="Total Visitors" value={stats.totalVisitors} />
            <AdminStatCard icon={BadgeCheck} label="Unique Visitors" value={stats.uniqueVisitors} />
            <AdminStatCard icon={UserCheck} label="Logged-in Visitors" value={stats.loggedInVisitors} />
            <AdminStatCard icon={UserX} label="Guest Visitors" value={stats.guestVisitors} />
            <AdminStatCard icon={MapPin} label="Location Allowed" value={stats.permissionAllowed} />
            <AdminStatCard icon={MapPinOff} label="Location Denied" value={stats.permissionDenied} />
            <AdminStatCard icon={CalendarDays} label="Today's Visitors" value={stats.todaysVisitors} />
            <AdminStatCard icon={CalendarRange} label="This Month's Visitors" value={stats.thisMonthsVisitors} />
          </div>
        )}

        <h3 className="text-h5 mb-3">Visitor Map</h3>
        {mapLoading ? (
          <div className="mb-8 h-[420px] animate-pulse rounded-2xl bg-background-subtle" aria-busy="true" />
        ) : mapError ? (
          <EmptyState icon={AlertTriangle} title="Couldn't load visitor map" description={mapErrorMessage} className="mb-8" />
        ) : (
          <div className="mb-8">
            <VisitorMap bubbles={bubbles} />
          </div>
        )}

        <h3 className="text-h5 mb-3">Recent Visitors</h3>

        <div className="mb-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || total === 0}
            className="btn-secondary btn-sm inline-flex items-center gap-2"
          >
            {isExporting ? <LoadingSpinner size="xs" /> : <Download className="h-3.5 w-3.5" aria-hidden="true" />}
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteAllOpen(true)}
            disabled={isDeletingAll || total === 0}
            className="btn-danger-ghost btn-sm inline-flex items-center gap-2"
          >
            {isDeletingAll && <LoadingSpinner size="xs" />}
            Delete All
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <AdminSearchInput
              id="admin-visitor-search"
              label="Search visitors"
              placeholder="Search by city, state, country, or browser…"
              value={filters.search}
              onChange={(value) => setFilter("search", value)}
            />
          </div>
          <select
            className="select w-full lg:w-40"
            value={filters.isGuest}
            onChange={(event) => setFilter("isGuest", event.target.value)}
            aria-label="Filter by guest/logged-in"
          >
            <option value="">Guest & logged-in</option>
            <option value="true">Guests only</option>
            <option value="false">Logged-in only</option>
          </select>
          <select
            className="select w-full lg:w-44"
            value={filters.permissionStatus}
            onChange={(event) => setFilter("permissionStatus", event.target.value)}
            aria-label="Filter by location permission"
          >
            <option value="">Any permission</option>
            <option value="granted">Allowed</option>
            <option value="denied">Denied</option>
            <option value="dismissed">Dismissed</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <select
            className="select w-full lg:w-40"
            value={filters.deviceType}
            onChange={(event) => setFilter("deviceType", event.target.value)}
            aria-label="Filter by device type"
          >
            <option value="">Any device</option>
            <option value="Mobile">Mobile</option>
            <option value="Desktop">Desktop</option>
            <option value="Tablet">Tablet</option>
          </select>
          <input
            type="date"
            className="input w-full lg:w-40"
            value={filters.startDate}
            onChange={(event) => setFilter("startDate", event.target.value)}
            aria-label="From date"
          />
          <input
            type="date"
            className="input w-full lg:w-40"
            value={filters.endDate}
            onChange={(event) => setFilter("endDate", event.target.value)}
            aria-label="To date"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-lg bg-background-subtle" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load visitors"
            description={errorMessage}
            action={
              <button type="button" onClick={refetch} className="btn-primary btn-sm">
                Retry
              </button>
            }
          />
        ) : visitors.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No visitors found" description="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-body-sm">
              <caption className="sr-only">Recent visitors</caption>
              <thead className="bg-background-subtle text-caption uppercase text-text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">Date</th>
                  <th scope="col" className="px-4 py-3">Time</th>
                  <th scope="col" className="px-4 py-3">City</th>
                  <th scope="col" className="px-4 py-3">State</th>
                  <th scope="col" className="px-4 py-3">Country</th>
                  <th scope="col" className="px-4 py-3">Browser</th>
                  <th scope="col" className="px-4 py-3">OS</th>
                  <th scope="col" className="px-4 py-3">Device</th>
                  <th scope="col" className="px-4 py-3">Visitor</th>
                  <th scope="col" className="px-4 py-3">Permission</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visitors.map((visitor) => {
                  const createdAt = new Date(visitor.createdAt);
                  const hasCoords = visitor.latitude !== null && visitor.longitude !== null;

                  return (
                    <tr key={visitor._id}>
                      <td className="px-4 py-3 text-text-muted">{createdAt.toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3 text-text-muted">{createdAt.toLocaleTimeString("en-IN")}</td>
                      <td className="px-4 py-3 text-text">{visitor.city || "—"}</td>
                      <td className="px-4 py-3 text-text-muted">{visitor.state || "—"}</td>
                      <td className="px-4 py-3 text-text-muted">{visitor.country || "—"}</td>
                      <td className="px-4 py-3 text-text-muted">{visitor.browser}</td>
                      <td className="px-4 py-3 text-text-muted">{visitor.operatingSystem}</td>
                      <td className="px-4 py-3 text-text-muted">{visitor.deviceType}</td>
                      <td className="px-4 py-3 text-text-muted">
                        {visitor.isGuest ? "Guest" : visitor.user?.name || "Logged-in user"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={PERMISSION_BADGE[visitor.permissionStatus] || "badge-neutral"}>
                          {visitor.permissionStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          {hasCoords ? (
                            <a
                              href={`https://www.google.com/maps?q=${visitor.latitude},${visitor.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-ghost btn-sm"
                              title="View on Google Maps"
                            >
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="btn-ghost btn-sm opacity-40"
                              title="No coordinates available"
                            >
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(visitor)}
                            className="btn-danger-ghost btn-sm"
                            title="Delete this record"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && (
          <Pagination
            page={filters.page}
            limit={limit}
            total={total}
            onPageChange={(page) => setFilter("page", page)}
          />
        )}
      </PageContainer>

      <DeleteVisitorDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
      <DeleteAllDialog
        isOpen={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        onConfirm={handleDeleteAll}
        title="Delete all visitor records?"
        description="Are you sure you want to delete ALL visitor records? This action cannot be undone."
        confirmLabel="Delete All"
        isSubmitting={isDeletingAll}
      />
    </Section>
  );
};

export default AdminVisitors;
