import { useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Modal, { ModalHeader } from "@/components/common/Modal";
import { REPORT_REASONS } from "@/constants";
import { createReport } from "@/api/reports";
import { getErrorMessage } from "@/utils/getErrorMessage";

const REASON_LABELS = {
  spam: "Spam",
  misleading: "Misleading information",
  prohibited: "Prohibited item",
  duplicate: "Duplicate listing",
  other: "Other",
};

const TITLE_ID = "report-modal-title";

const ReportModal = ({ isOpen, onClose, productId }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    setReason("");
    setDescription("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!reason) return;

    setIsSubmitting(true);
    try {
      const response = await createReport({ productId, reason, description: description || undefined });
      toast.success(response.data.message || "Report submitted");
      handleClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't submit your report"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} titleId={TITLE_ID}>
      <ModalHeader titleId={TITLE_ID} title="Report this listing" onClose={handleClose} />

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend className="field-label">Reason</legend>
          <div className="-mx-2">
            {REPORT_REASONS.map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2.5 text-body-sm text-text-secondary transition-colors duration-base ease-standard hover:bg-surface-hover"
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={value}
                  checked={reason === value}
                  onChange={() => setReason(value)}
                  className="h-4.5 w-4.5 shrink-0 accent-primary"
                />
                <span className={reason === value ? "font-medium text-text" : undefined}>{REASON_LABELS[value]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4">
          <label htmlFor="report-description" className="field-label">
            Additional details (optional)
          </label>
          <textarea
            id="report-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Anything else we should know?"
            className="textarea"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="btn-ghost !rounded-xl btn-tactile"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-danger !rounded-xl shadow-sm btn-tactile hover:shadow-md"
            disabled={!reason || isSubmitting}
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            {isSubmitting ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportModal;
