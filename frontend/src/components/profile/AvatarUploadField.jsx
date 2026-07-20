import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Camera, Trash2, User as UserIcon } from "lucide-react";
import { updateAvatar, deleteAvatar } from "@/api/users";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { validateImageFile } from "@/utils/productValidationRules";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AvatarLightbox from "@/components/common/AvatarLightbox";

/**
 * Uploads instantly on selection rather than batching with the main
 * profile form's Save — PUT /users/me/avatar is its own endpoint,
 * entirely separate from PUT /users/me (updateProfile), so treating
 * it as one save action would misrepresent two independent requests
 * as a single one. Reuses validateImageFile/size-type constants from
 * productValidationRules.js since uploadSingleImage shares the exact
 * same multer config (5MB, jpeg/png/webp) as product image uploads.
 */
const AvatarUploadField = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploading(true);
    try {
      const response = await updateAvatar(file);
      setUser(response.data.data.user);
      toast.success(response.data.message || "Avatar updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't update your avatar"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    try {
      const response = await deleteAvatar();
      setUser(response.data.data.user);
      toast.success(response.data.message || "Avatar removed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't remove your avatar"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
      <div className="relative shrink-0">
        {user?.avatar ? (
          <button
            type="button"
            onClick={() => setIsAvatarOpen(true)}
            className="h-20 w-20 rounded-full ring-2 ring-border ring-offset-2 ring-offset-surface"
            aria-label="View full profile photo"
          >
            <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
          </button>
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-subtle text-primary-subtle-text ring-2 ring-border ring-offset-2 ring-offset-surface">
            <UserIcon className="h-8 w-8" aria-hidden="true" />
          </span>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-950/50 text-white">
            <LoadingSpinner size="md" />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 sm:items-start">
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="btn-secondary btn-sm"
          >
            {isUploading ? <LoadingSpinner size="xs" /> : <Camera className="h-4 w-4" aria-hidden="true" />}
            {user?.avatar ? "Change photo" : "Upload photo"}
          </button>
          {user?.avatar && (
            <button type="button" onClick={handleRemove} disabled={isUploading} className="btn-danger-ghost btn-sm">
              {isUploading ? <LoadingSpinner size="xs" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
              Remove
            </button>
          )}
        </div>
        <p className="field-hint mt-0">Any image format (JPG, PNG, WEBP, HEIC, etc.) · up to 5MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Upload profile photo"
      />

      <AvatarLightbox isOpen={isAvatarOpen} onClose={() => setIsAvatarOpen(false)} src={user?.avatar} name={user?.name} />
    </div>
  );
};

export default AvatarUploadField;
