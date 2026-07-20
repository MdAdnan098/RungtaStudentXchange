import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";
import PasswordField from "@/components/auth/PasswordField";
import FormError from "@/components/auth/FormError";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ForgotPasswordFlow from "@/components/auth/ForgotPasswordFlow";
import { changePassword } from "@/api/users";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { passwordRule, confirmPasswordRule } from "@/utils/validationRules";

/**
 * Self-contained "Change Password" form — its own submit action,
 * separate from the profile-info form above it on this page. Same
 * reasoning as AvatarUploadField already on this page: PUT
 * /users/me/password (userController.changePassword) is a fully
 * independent endpoint from updateProfile, so it gets its own submit
 * rather than being folded into one combined "Save" that would
 * misrepresent two separate requests as one.
 *
 * "Forgot Password?" used to link to the /forgot-password page, but
 * that route sits behind GuestRoute — a logged-in user clicking it
 * was getting bounced straight to "/", which read as broken. It now
 * swaps in the same <ForgotPasswordFlow> used on Login, inline in
 * this card, so the email/OTP form opens right here instead.
 */
const ChangePasswordSection = () => {
  const [submitError, setSubmitError] = useState(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (formData) => {
    setSubmitError(null);
    try {
      const response = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success(response.data.message || "Password changed successfully");
      reset();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Password change nahi ho paaya, dobara try karo"));
    }
  };

  if (isForgotPasswordOpen) {
    return (
      <div className="card-padded mt-6">
        <ForgotPasswordFlow
          onCancel={() => setIsForgotPasswordOpen(false)}
          onDone={() => {
            toast.success("Password reset ho gaya — ab naya password use kar sakte ho.");
            setIsForgotPasswordOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="card-padded mt-6">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary-subtle-text">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className="text-h5">Change Password</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormError message={submitError} />

        <div className="space-y-5">
          <PasswordField
            id="change-password-current"
            label="Current password"
            placeholder="Apna current password dalo"
            autoComplete="current-password"
            registration={register("currentPassword", { required: "Current password is required" })}
            error={errors.currentPassword?.message}
          />

          <PasswordField
            id="change-password-new"
            label="New password"
            placeholder="Naya password"
            autoComplete="new-password"
            registration={register("newPassword", passwordRule)}
            error={errors.newPassword?.message}
          />

          <PasswordField
            id="change-password-confirm"
            label="Confirm new password"
            placeholder="Naya password dobara dalo"
            autoComplete="new-password"
            registration={register("confirmNewPassword", confirmPasswordRule(() => getValues("newPassword")))}
            error={errors.confirmNewPassword?.message}
          />
        </div>

        <div className="mt-5 rounded-lg border border-border bg-background-subtle px-4 py-3.5">
          <p className="text-body-sm text-text-muted">
            Purana password yaad nahi? Registration ke time jo email use kiya tha, wahi humare Forgot Password page
            par fill kar dena — 30 second se bhi kam lagega 🙂
          </p>
          <button type="button" onClick={() => setIsForgotPasswordOpen(true)} className="btn-secondary btn-sm mt-3">
            <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
            Forgot Password?
          </button>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary mt-6 w-full justify-center sm:w-auto">
          {isSubmitting && <LoadingSpinner size="sm" />}
          {isSubmitting ? "Changing…" : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordSection;
