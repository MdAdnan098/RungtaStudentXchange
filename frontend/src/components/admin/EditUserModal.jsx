import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal, { ModalHeader } from "@/components/common/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { updateUserByAdmin } from "@/api/admin";
import { getErrorMessage } from "@/utils/getErrorMessage";

const TITLE_ID = "edit-user-title";

const EMPTY_FORM = { name: "", email: "", phone: "", location: "", bio: "" };

/**
 * Admin-only "edit user" form — separate from UserDetailModal (read-
 * only overview). Only exposes the profile fields
 * adminController.updateUserByAdmin actually accepts (name, email,
 * phone, location, bio) — role changes aren't offered here to avoid
 * accidental privilege escalation from this screen.
 */
const EditUserModal = ({ user, isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
      });
      setError(null);
    }
  }, [isOpen, user]);

  const handleChange = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await updateUserByAdmin(user._id, form);
      toast.success(response.data.message || "User updated");
      onSuccess(response.data.data.user);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't update this user"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId={TITLE_ID} maxWidthClass="max-w-lg">
      <ModalHeader titleId={TITLE_ID} title="Edit user" onClose={onClose} />

      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <p className="mb-4 rounded-lg border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-body-sm text-danger-text">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="edit-user-name" className="field-label">
              Name
            </label>
            <input id="edit-user-name" className="input" value={form.name} onChange={handleChange("name")} required />
          </div>

          <div>
            <label htmlFor="edit-user-email" className="field-label">
              Email
            </label>
            <input
              id="edit-user-email"
              type="email"
              className="input"
              value={form.email}
              onChange={handleChange("email")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-user-phone" className="field-label">
                Phone
              </label>
              <input id="edit-user-phone" className="input" value={form.phone} onChange={handleChange("phone")} />
            </div>

            <div>
              <label htmlFor="edit-user-location" className="field-label">
                Location
              </label>
              <input
                id="edit-user-location"
                className="input"
                value={form.location}
                onChange={handleChange("location")}
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-user-bio" className="field-label">
              Bio
            </label>
            <textarea id="edit-user-bio" rows={3} className="textarea" value={form.bio} onChange={handleChange("bio")} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting && <LoadingSpinner size="sm" />}
            {isSubmitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserModal;
