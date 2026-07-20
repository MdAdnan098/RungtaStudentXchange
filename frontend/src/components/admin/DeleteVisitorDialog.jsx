import { useRef } from "react";
import Modal, { ModalHeader } from "@/components/common/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const TITLE_ID = "delete-visitor-title";

// Mirrors DeleteUserDialog.jsx exactly — same Modal, same shared
// LoadingSpinner while submitting.
const DeleteVisitorDialog = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
  const cancelButtonRef = useRef(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId={TITLE_ID} initialFocusRef={cancelButtonRef}>
      <ModalHeader titleId={TITLE_ID} title="Delete this visitor record?" onClose={onClose} />

      <p className="text-body-sm text-text-muted">
        This permanently removes this visit record from the database. This cannot be undone.
      </p>

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
        <button type="button" onClick={onConfirm} className="btn-danger" disabled={isSubmitting}>
          {isSubmitting && <LoadingSpinner size="sm" />}
          {isSubmitting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteVisitorDialog;
