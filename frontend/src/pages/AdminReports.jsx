import { useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, Flag } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import AdminNav from "@/components/admin/AdminNav";
import ReportDetailModal from "@/components/admin/ReportDetailModal";
import DeleteAllDialog from "@/components/admin/DeleteAllDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/browse/Pagination";
import { useAdminReports } from "@/hooks/useAdminReports";
import { deleteAllReports } from "@/api/admin";
import { getErrorMessage } from "@/utils/getErrorMessage";

const STATUS_BADGE = {
  pending: "badge-warning",
  reviewed: "badge-primary",
  resolved: "badge-success",
  dismissed: "badge-neutral",
};

const STATUS_OPTIONS = ["pending", "reviewed", "resolved", "dismissed"];

/**
 * Status changes go through updateReportStatus. Delete (deleteReport)
 * is handled inside ReportDetailModal, which also owns its own
 * confirm step — this page just removes the report from the list and
 * closes the modal once that succeeds.
 */
const AdminReports = () => {
  const {
    reports,
    total,
    limit,
    filters,
    setFilter,
    isLoading,
    isError,
    errorMessage,
    refetch,
    updateReportLocally,
    removeReportLocally,
  } = useAdminReports();
  const [detailReportId, setDetailReportId] = useState(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      const response = await deleteAllReports();
      toast.success(response.data.message || "All reports deleted");
      setIsDeleteAllOpen(false);
      refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't delete all reports"));
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <Section spacing="md">
      <PageContainer>
        <h1 className="text-h2 mb-4">Admin Dashboard</h1>
        <AdminNav />

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsDeleteAllOpen(true)}
            disabled={isDeletingAll}
            className="btn-danger-ghost btn-sm inline-flex items-center gap-2"
          >
            {isDeletingAll && <LoadingSpinner size="xs" />}
            Delete All Reports
          </button>
        </div>

        <div className="mb-4">
          <select
            className="select w-full sm:w-48"
            value={filters.status}
            onChange={(event) => setFilter("status", event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-lg bg-background-subtle" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load reports"
            description={errorMessage}
            action={
              <button type="button" onClick={refetch} className="btn-primary btn-sm">
                Retry
              </button>
            }
          />
        ) : reports.length === 0 ? (
          <EmptyState icon={Flag} title="No reports found" description="Nothing matches this filter right now." />
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border" aria-label="Reports">
            {reports.map((report) => (
              <li key={report._id}>
                <button
                  type="button"
                  onClick={() => setDetailReportId(report._id)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left hover:bg-surface-hover transition-colors duration-base ease-standard"
                >
                  <div className="min-w-0">
                    <p className="truncate text-body-sm font-medium text-text">
                      {report.product?.title || "Listing no longer exists"}
                    </p>
                    <p className="truncate text-caption text-text-muted">
                      {report.reason} · reported by {report.reporter?.name || "unknown"}
                    </p>
                  </div>
                  <span className={`shrink-0 ${STATUS_BADGE[report.status] || "badge-neutral"}`}>
                    {report.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
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

      <ReportDetailModal
        reportId={detailReportId}
        isOpen={Boolean(detailReportId)}
        onClose={() => setDetailReportId(null)}
        onStatusChange={updateReportLocally}
        onDelete={(reportId) => {
          removeReportLocally(reportId);
          setDetailReportId(null);
        }}
      />
      <DeleteAllDialog
        isOpen={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        onConfirm={handleDeleteAll}
        title="Delete all reports?"
        description="Are you sure you want to delete ALL reports? This action cannot be undone."
        confirmLabel="Delete All Reports"
        isSubmitting={isDeletingAll}
      />
    </Section>
  );
};

export default AdminReports;
