import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, Info, Lock } from "lucide-react";
import { passwordRule, confirmPasswordRule } from "@/utils/validationRules";
import AuthCard from "@/components/auth/AuthCard";
import PasswordField from "@/components/auth/PasswordField";
import FormNote from "@/components/auth/FormNote";
import { usePageTitle } from "@/hooks/usePageTitle";
import LoadingSpinner from "@/components/common/LoadingSpinner";

/**
 * Same situation as before: no backend route exists for this (no
 * /api/auth/reset-password, no token-verification endpoint — checked
 * every route file). Built as a complete form so a real `?token=...`
 * link + endpoint can be wired in later without a redesign; reads the
 * token from the URL and shows a clear message if it's missing, but
 * never sends the token anywhere since there's nothing to send it to
 * yet. Visual polish only — same disclosures, same non-functional
 * submit handler, just presented with the recovery flow's card/field
 * components instead of plain text blocks.
 */
const ResetPassword = () => {
  usePageTitle("Reset Password");

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async () => {
    toast.error("Password reset isn't available yet. Please contact support to reset your password.");
  };

  return (
    <AuthCard
      icon={<Lock className="h-5 w-5" aria-hidden="true" />}
      title="Reset password"
      subtitle="Choose a new password to keep your account secure"
    >
      <FormNote icon={<Info className="h-4 w-4" aria-hidden="true" />}>
        This form isn't connected to a backend yet — there's no reset endpoint to send it to.
      </FormNote>

      {!token && (
        <FormNote tone="warning" icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}>
          This link is missing its reset token — you'd normally reach this page from an email link.
        </FormNote>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <PasswordField
            id="reset-password-new"
            label="New password"
            registration={register("password", passwordRule)}
            error={errors.password?.message}
          />

          <PasswordField
            id="reset-password-confirm"
            label="Confirm new password"
            registration={register("confirmPassword", confirmPasswordRule(() => getValues("password")))}
            error={errors.confirmPassword?.message}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary btn-lg mt-7 h-12 w-full text-body font-semibold tracking-tight"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              Resetting…
            </>
          ) : (
            "Reset Password"
          )}
        </button>

        <p className="mt-6 text-center text-body-sm text-text-muted">
          <Link
            to="/login"
            className="font-medium text-primary transition-colors duration-base ease-standard hover:text-primary-hover"
          >
            Back to login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;
