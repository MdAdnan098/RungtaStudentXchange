import { useRef } from "react";
import Modal, { ModalHeader } from "@/components/common/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const TITLE_ID = "delete-all-title";

/**
 * Shared confirm dialog for the three "Delete All" bulk actions
 * (Users, Listings, Reports) on the Admin Dashboard. Mirrors the
 * existing DeleteUserDialog / DeleteProductDialog pattern exactly —
 * same Modal, same shared LoadingSpinner while submitting — just
 * parameterized so it doesn't need to be duplicated three times.
 */
const DeleteAllDialog = ({ isOpen, onClose, onConfirm, title, description, confirmLabel, isSubmitting }) => {
  const cancelButtonRef = useRef(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId={TITLE_ID} initialFocusRef={cancelButtonRef}>
      <ModalHeader titleId={TITLE_ID} title={title} onClose={onClose} />

      <p className="text-body-sm text-text-muted">{description}</p>

      <div className="mt-6 flex justify-end gap-2">
        <button
          ref={cancelButtonRef}
          type="button"
          onClick={onClose}
          className="btn-ghost"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="btn-danger inline-flex items-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting && <LoadingSpinner size="sm" />}
          {isSubmitting ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteAllDialog;
