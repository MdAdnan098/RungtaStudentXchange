import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Modal, { ModalHeader } from "@/components/common/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { deleteMyAccount } from "@/api/users";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/utils/getErrorMessage";

const TITLE_ID = "delete-account-title";

/**
 * The consequences listed here are deliberately specific, not generic
 * "this can't be undone" copy — deleteMyAccount (userController.js)
 * does NOT cascade to a user's products, conversations, or messages,
 * only removing the User document and their Cloudinary avatar. That
 * means listings/chats visibly outlive the deleted account (see the
 * backend limitations note in the final summary) — worth being
 * upfront about that before someone deletes their account expecting
 * a clean slate.
 */
const DeleteAccountDialog = ({ isOpen, onClose }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelButtonRef = useRef(null);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteMyAccount();
      toast.success(response.data.message || "Account deleted");
      logout();
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't delete your account"));
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId={TITLE_ID} initialFocusRef={cancelButtonRef}>
      <ModalHeader titleId={TITLE_ID} title="Delete your account?" onClose={onClose} />

      <div className="space-y-2 text-body-sm text-text-muted">
        <p>This permanently deletes your account and profile photo. This can't be undone.</p>
        <p>
          Your existing product listings and chat conversations will <strong className="text-text">not</strong> be
          removed automatically — they'll remain visible to others, just without an active account attached.
        </p>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button ref={cancelButtonRef} type="button" onClick={onClose} className="btn-ghost" disabled={isDeleting}>
          Cancel
        </button>
        <button type="button" onClick={handleConfirm} className="btn-danger" disabled={isDeleting}>
          {isDeleting && <LoadingSpinner size="sm" />}
          {isDeleting ? "Deleting…" : "Delete my account"}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteAccountDialog;
