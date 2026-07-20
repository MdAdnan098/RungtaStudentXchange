import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";
import Modal, { ModalHeader } from "@/components/common/Modal";
import { getReportById, updateReportStatus, deleteReport } from "@/api/admin";
import { getErrorMessage } from "@/utils/getErrorMessage";

const TITLE_ID = "report-detail-title";
const STATUS_OPTIONS = ["pending", "reviewed", "resolved", "dismissed"];

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-1.5 text-body-sm">
    <span className="text-text-muted">{label}</span>
    <span className="text-right text-text">{value ?? "—"}</span>
  </div>
);

/**
 * Status change was previously the *only* report action the backend
 * supported — delete is now also available (adminController.js
 * deleteReport), so it's added here. resolvedBy/resolvedAt are still
 * set automatically server-side when status becomes "resolved" or
 * "dismissed", not something this form sets directly.
 *
 * `report.product` can be null — same no-cascade-delete-on-old-data
 * pattern seen throughout this backend (deleting a product used to
 * leave orphaned reports behind) — handled defensively below. New
 * deletes of a product now clean up its reports automatically, so
 * this only shows up for reports that already existed before that
 * fix.
 *
 * Deleting is a separate confirm step inline (not a second stacked
 * modal) — click "Delete Report" to reveal a confirm/cancel pair,
 * matching the low-friction, single-modal flow the rest of this
 * dialog already uses.
 */
const ReportDetailModal = ({ reportId, isOpen, onClose, onStatusChange, onDelete }) => {
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen || !reportId) return;
    setStatus("loading");
    setIsConfirmingDelete(false);
    const controller = new AbortController();

    getReportById(reportId, { signal: controller.signal })
      .then((response) => {
        setReport(response.data.data.report);
        setStatus("loaded");
      })
      .catch((err) => {
        if (err.code === "ERR_CANCELED") return;
        setStatus("error");
        setError(getErrorMessage(err, "Failed to load report"));
      });

    return () => controller.abort();
  }, [isOpen, reportId]);

  const handleStatusChange = async (event) => {
    const nextStatus = event.target.value;
    setIsUpdating(true);
    try {
      const response = await updateReportStatus(reportId, nextStatus);
      setReport(response.data.data.report);
      onStatusChange(reportId, { status: response.data.data.report.status });
      toast.success(response.data.message || "Report status updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't update report status"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteReport(reportId);
      toast.success(response.data.message || "Report deleted");
      onDelete(reportId);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete this report"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId={TITLE_ID} maxWidthClass="max-w-lg">
      <ModalHeader titleId={TITLE_ID} title="Report details" onClose={onClose} />

      {status === "loading" && (
        <div className="space-y-2 py-4" aria-busy="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-4 w-full animate-pulse rounded bg-background-subtle" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-body-sm text-danger-text">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {status === "loaded" && report && (
        <div>
          <div className="divide-y divide-border">
            <InfoRow label="Reason" value={report.reason} />
            <InfoRow label="Description" value={report.description} />
            <InfoRow label="Reported by" value={`${report.reporter?.name} (${report.reporter?.email})`} />
            <InfoRow
              label="Product"
              value={
                report.product ? (
                  <Link to={`/products/${report.product._id}`} className="text-primary hover:underline">
                    {report.product.title}
                  </Link>
                ) : (
                  "Listing no longer exists"
                )
              }
            />
            <InfoRow label="Filed" value={new Date(report.createdAt).toLocaleDateString("en-IN")} />
            {report.resolvedBy && (
              <InfoRow label="Resolved by" value={`${report.resolvedBy.name} (${report.resolvedBy.email})`} />
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="report-status" className="field-label">
              Status
            </label>
            <select
              id="report-status"
              className="select"
              value={report.status}
              onChange={handleStatusChange}
              disabled={isUpdating}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 border-t border-border pt-4">
            {isConfirmingDelete ? (
              <div className="space-y-2.5">
                <p className="text-body-sm text-text-muted">
                  This permanently removes the report from the database. This cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="btn-ghost btn-sm"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button type="button" onClick={handleDelete} className="btn-danger btn-sm" disabled={isDeleting}>
                    {isDeleting ? "Deleting…" : "Confirm Delete"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="btn-danger-ghost btn-sm"
                >
                  Delete Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReportDetailModal;
