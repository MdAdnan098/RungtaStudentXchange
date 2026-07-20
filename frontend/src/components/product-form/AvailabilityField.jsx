import { useState } from "react";
import toast from "react-hot-toast";
import { CircleDot } from "lucide-react";
import { updateProductStatus } from "@/api/products";
import { getErrorMessage } from "@/utils/getErrorMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const BASE_OPTIONS = [
  { value: "active", label: "Active — visible in Browse" },
  { value: "sold", label: "Sold — hidden from Browse" },
];

/**
 * "Availability" was requested as a form field, but neither
 * createProduct nor updateProduct accept a `status` field in their
 * body (see backend limitations in the final summary) — only the
 * separate PATCH /products/:id/status endpoint can change it. Rather
 * than silently drop the feature, this renders as its own small,
 * independent control (its own save action, not tied to the main
 * form's submit) using that real endpoint. Not shown in create mode:
 * a brand-new listing always starts "active" and createProduct has
 * no way to set anything else.
 *
 * "removed" is only ever offered as an option if the listing is
 * *already* removed (so the current state displays correctly and can
 * be reversed) — it's otherwise left out on purpose. Removal reads as
 * an admin/moderation action (see adminRoutes.js) as much as a seller
 * self-service one, and a seller who wants their own listing gone
 * already has Delete.
 */
const AvailabilityField = ({ productId, status, onStatusChange }) => {
  const [isSaving, setIsSaving] = useState(false);
  const options =
    status === "removed" ? [{ value: "removed", label: "Removed — hidden by admin" }, ...BASE_OPTIONS] : BASE_OPTIONS;

  const handleChange = async (event) => {
    const nextStatus = event.target.value;
    setIsSaving(true);
    try {
      const response = await updateProductStatus(productId, nextStatus);
      onStatusChange(response.data.data.product.status);
      toast.success(response.data.message || "Availability updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't update availability"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="mb-2.5 flex items-center gap-2 px-1">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary-subtle-text">
          <CircleDot className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <h2 className="text-overline uppercase tracking-wide text-text-muted">Availability</h2>
      </div>
      <div className="card-padded">
        <label htmlFor="product-availability" className="field-label">
          Listing status
        </label>
        <div className="relative">
          <select
            id="product-availability"
            className="select py-3"
            value={status}
            onChange={handleChange}
            disabled={isSaving}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isSaving && (
            <LoadingSpinner
              size="sm"
              className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 text-text-muted"
            />
          )}
        </div>
        <p className="field-hint">Changes immediately — separate from the form below.</p>
      </div>
    </div>
  );
};

export default AvailabilityField;
