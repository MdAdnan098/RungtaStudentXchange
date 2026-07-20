import { useRef } from "react";
import Modal, { ModalHeader } from "@/components/common/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const TITLE_ID = "revoke-verification-title";

/**
 * Same shape as DeleteUserDialog — a centered Modal with Cancel
 * getting initial focus so an accidental Enter can't confirm the
 * destructive action. Unverifying isn't reversible from this screen
 * (the student would need to redo email verification), so it gets
 * the same "are you sure" treatment as Delete.
 */
const RevokeVerificationDialog = ({ isOpen, onClose, onConfirm, userName, isSubmitting }) => {
  const cancelButtonRef = useRef(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId={TITLE_ID} initialFocusRef={cancelButtonRef}>
      <ModalHeader titleId={TITLE_ID} title={`Unverify ${userName}?`} onClose={onClose} />

      <p className="text-body-sm text-text-muted">
        This removes their Verified Student badge. They'll need to complete email verification again to get it
        back.
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
          {isSubmitting ? "Removing…" : "Unverify"}
        </button>
      </div>
    </Modal>
  );
};

export default RevokeVerificationDialog;
