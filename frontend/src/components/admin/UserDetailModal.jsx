import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, BadgeCheck, Pencil } from "lucide-react";
import Modal, { ModalHeader } from "@/components/common/Modal";
import { getUserDetails } from "@/api/admin";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { formatPrice } from "@/utils/formatPrice";

const TITLE_ID = "user-detail-title";

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-1.5 text-body-sm">
    <span className="text-text-muted">{label}</span>
    <span className="text-right text-text">{value ?? "—"}</span>
  </div>
);

const UserDetailModal = ({ userId, isOpen, onClose, onEdit }) => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !userId) return;
    setStatus("loading");
    const controller = new AbortController();

    getUserDetails(userId, { signal: controller.signal })
      .then((response) => {
        setData(response.data.data);
        setStatus("loaded");
      })
      .catch((err) => {
        if (err.code === "ERR_CANCELED") return;
        setStatus("error");
        setError(getErrorMessage(err, "Failed to load user details"));
      });

    return () => controller.abort();
  }, [isOpen, userId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId={TITLE_ID} maxWidthClass="max-w-lg">
      <ModalHeader titleId={TITLE_ID} title="User details" onClose={onClose} />

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

      {status === "loaded" && data && (
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-h5">{data.user.name}</p>
              {data.user.isStudentVerified && (
                <BadgeCheck className="h-4 w-4 text-primary" aria-label="Verified student" />
              )}
            </div>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(data.user)}
                className="btn-ghost btn-sm shrink-0"
                title="Edit user"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </button>
            )}
          </div>

          <div className="mt-3 divide-y divide-border">
            <InfoRow label="Email" value={data.user.email} />
            <InfoRow label="Role" value={data.user.role} />
            <InfoRow label="Phone" value={data.user.phone} />
            <InfoRow label="Location" value={data.user.location} />
            <InfoRow
              label="Banned"
              value={data.user.isBanned ? `Yes — ${data.user.bannedReason || "no reason given"}` : "No"}
            />
            <InfoRow label="Joined" value={new Date(data.user.createdAt).toLocaleDateString("en-IN")} />
          </div>

          <p className="field-label mb-2 mt-4">Listings ({data.listings.length})</p>
          {data.listings.length === 0 ? (
            <p className="text-body-sm text-text-muted">No listings.</p>
          ) : (
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {data.listings.map((listing) => (
                <li key={listing._id}>
                  <Link
                    to={`/products/${listing._id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-body-sm hover:bg-surface-hover transition-colors duration-base ease-standard"
                  >
                    <span className="truncate text-text">{listing.title}</span>
                    <span className="shrink-0 text-caption text-text-muted">
                      {formatPrice(listing.price)} · {listing.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
};

export default UserDetailModal;
