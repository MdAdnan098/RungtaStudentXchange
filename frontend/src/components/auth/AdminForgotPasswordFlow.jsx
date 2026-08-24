import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { CheckCircle2, KeyRound, User } from "lucide-react";
import { resetAdminPassword } from "@/api/auth";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { passwordRule, confirmPasswordRule } from "@/utils/validationRules";
import { AuthCardHeader } from "@/components/auth/AuthCard";
import TextField from "@/components/auth/TextField";
import PasswordField from "@/components/auth/PasswordField";
import FormNote from "@/components/auth/FormNote";
import FormError from "@/components/auth/FormError";
import LoadingSpinner from "@/components/common/LoadingSpinner";

/**
 * Admin accounts have no email on file (they're created with a
 * username + ADMIN_REGISTER_SECRET, not email/OTP verification), so
 * the normal ForgotPasswordFlow (mobile + email → OTP) doesn't apply
 * to them. This is the admin equivalent: username + the same admin
 * secret key from .env, straight to a new password — one step, no
 * OTP, since the secret key itself is the proof of identity.
 */
const AdminForgotPasswordFlow = ({ onCancel, onDone }) => {
  const [submitError, setSubmitError] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const { register, handleSubmit, getValues, formState } = useForm({ mode: "onBlur" });

  const onSubmit = async (formData) => {
    setSubmitError(null);
    try {
      const response = await resetAdminPassword({
        username: formData.username,
        adminSecret: formData.adminSecret,
        newPassword: formData.newPassword,
      });
      toast.success(response.data.message || "Password reset successfully");
      setIsDone(true);
      setTimeout(() => onDone?.(), 1500);
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Couldn't reset the password. Please try again."));
    }
  };

  return (
    <div>
      <AuthCardHeader
        icon={
          isDone ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          ) : (
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          )
        }
        title={isDone ? "You're all set!" : "Reset admin password"}
        subtitle={isDone ? "Password updated" : "Enter your admin username and secret key to set a new password"}
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7">
        <FormError message={submitError} />

        <FormNote>
          This is not linked to any email. Enter the admin secret key stored in your server's environment
          variables, along with your admin username, to set a new password.
        </FormNote>

        <div className="space-y-5">
          <TextField
            id="admin-forgot-username"
            label="Admin username"
            type="text"
            autoComplete="username"
            placeholder="Your admin username"
            icon={<User className="h-4 w-4" aria-hidden="true" />}
            registration={register("username", { required: "Username is required" })}
            error={formState.errors.username?.message}
          />

          <PasswordField
            id="admin-forgot-secret"
            label="Admin secret key"
            placeholder="Secret key from server settings"
            registration={register("adminSecret", { required: "Secret key is required" })}
            error={formState.errors.adminSecret?.message}
          />

          <PasswordField
            id="admin-forgot-new-password"
            label="New password"
            placeholder="Choose a new password"
            autoComplete="new-password"
            registration={register("newPassword", passwordRule)}
            error={formState.errors.newPassword?.message}
          />

          <PasswordField
            id="admin-forgot-confirm-password"
            label="Confirm new password"
            placeholder="Re-enter the new password"
            autoComplete="new-password"
            registration={register("confirmNewPassword", confirmPasswordRule(() => getValues("newPassword")))}
            error={formState.errors.confirmNewPassword?.message}
          />
        </div>

        <button
          type="submit"
          disabled={formState.isSubmitting || isDone}
          className="btn-primary btn-lg mt-7 h-12 w-full text-body font-semibold tracking-tight"
        >
          {isDone ? (
            <>
              <LoadingSpinner size="sm" />
              Done…
            </>
          ) : formState.isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              Resetting…
            </>
          ) : (
            "Reset Password"
          )}
        </button>

        {onCancel && !isDone && (
          <p className="mt-6 text-center text-body-sm text-text-muted">
            Remembered your password?{" "}
            <button
              type="button"
              onClick={onCancel}
              className="font-medium text-primary transition-colors duration-base ease-standard hover:text-primary-hover"
            >
              Go back
            </button>
          </p>
        )}
      </form>
    </div>
  );
};

export default AdminForgotPasswordFlow;