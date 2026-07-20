import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Info, Mail, Phone, User, UserPlus } from "lucide-react";
import { registerUser } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { emailRule, nameRule, phoneRule, passwordRule, confirmPasswordRule } from "@/utils/validationRules";
import AuthCard from "@/components/auth/AuthCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import TextField from "@/components/auth/TextField";
import PasswordField from "@/components/auth/PasswordField";
import FormNote from "@/components/auth/FormNote";
import FormError from "@/components/auth/FormError";
import { usePageTitle } from "@/hooks/usePageTitle";

/**
 * Registration is a single step: POST /auth/register creates the
 * account immediately and returns a token — no OTP/email-verification
 * step in between. Email is collected only as a future password-reset
 * recovery address (see the helper text under the field); it is not
 * verified during registration.
 *
 * Reuses the same AuthCard / TextField / PasswordField
 * presentational components as the Login page (unmodified) so both
 * pages read as one consistent, polished auth experience. Shared
 * AuthCard / TextField / PasswordField — still used by Forgot
 * Password, Reset Password, Admin Login/Register, Profile Edit —
 * are untouched.
 */
const Register = () => {
  usePageTitle("Create Account");

  const [submitError, setSubmitError] = useState(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const registerForm = useForm({ mode: "onBlur" });

  const onRegisterSubmit = async (formData) => {
    setSubmitError(null);

    try {
      const response = await registerUser({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });
      const { user: newUser, token } = response.data.data;

      setAuth({ user: newUser, token });
      toast.success(response.data.message || "Account created");
      navigate("/", { replace: true });
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Failed to create account"));
    }
  };

  return (
    <AuthCard
      icon={<UserPlus className="h-5 w-5" aria-hidden="true" />}
      title="Create your account"
      subtitle="Join the Rungta student marketplace — buy, sell, and connect with your campus."
    >
      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} noValidate>
        <FormError message={submitError} />

        <div className="space-y-5">
          <TextField
            id="register-name"
            label="Full name"
            autoComplete="name"
            placeholder="Your name"
            icon={<User className="h-4 w-4" aria-hidden="true" />}
            registration={registerForm.register("name", nameRule)}
            error={registerForm.formState.errors.name?.message}
          />

          <TextField
            id="register-phone"
            label="Mobile number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            placeholder="9876543210"
            icon={<Phone className="h-4 w-4" aria-hidden="true" />}
            registration={registerForm.register("phone", phoneRule)}
            error={registerForm.formState.errors.phone?.message}
          />

          <div>
            <TextField
              id="register-email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" aria-hidden="true" />}
              registration={registerForm.register("email", emailRule)}
              error={registerForm.formState.errors.email?.message}
            />
            <div className="mt-2">
              <FormNote icon={<Info className="h-3.5 w-3.5" aria-hidden="true" />}>
                Ye email sirf ek hi baar maanga ja raha hai — future me password bhool jao to isi email se reset kar
                paoge.
              </FormNote>
            </div>
          </div>

          <PasswordField
            id="register-password"
            label="Password"
            autoComplete="new-password"
            registration={registerForm.register("password", passwordRule)}
            error={registerForm.formState.errors.password?.message}
          />

          <PasswordField
            id="register-confirm-password"
            label="Confirm password"
            autoComplete="new-password"
            registration={registerForm.register(
              "confirmPassword",
              confirmPasswordRule(() => registerForm.getValues("password"))
            )}
            error={registerForm.formState.errors.confirmPassword?.message}
          />
        </div>

        <button
          type="submit"
          disabled={registerForm.formState.isSubmitting}
          className="btn-primary btn-lg mt-7 h-12 w-full text-body font-semibold tracking-tight"
        >
          {registerForm.formState.isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <p className="mt-6 text-center text-body-sm text-text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary transition-colors duration-base ease-standard hover:text-primary-hover"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default Register;
