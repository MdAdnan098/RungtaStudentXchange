import { useRef } from "react";
import Modal, { ModalHeader } from "@/components/common/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const TITLE_ID = "delete-confirm-title";

const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  const cancelButtonRef = useRef(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId={TITLE_ID} initialFocusRef={cancelButtonRef}>
      <ModalHeader titleId={TITLE_ID} title="Delete this listing?" onClose={onClose} />

      <p className="text-body-sm text-text-muted">
        This can't be undone. The listing and its photos will be permanently removed.
      </p>

      <div className="mt-6 flex justify-end gap-2">
        <button
          ref={cancelButtonRef}
          type="button"
          onClick={onClose}
          className="btn-ghost !rounded-xl btn-tactile"
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="btn-danger !rounded-xl shadow-sm btn-tactile hover:shadow-md"
          disabled={isDeleting}
        >
          {isDeleting && <LoadingSpinner size="sm" />}
          {isDeleting ? "Deleting…" : "Delete listing"}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmDialog;
