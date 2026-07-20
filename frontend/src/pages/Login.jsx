import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogIn, Phone } from "lucide-react";
import { loginUser } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { phoneRule, passwordRule } from "@/utils/validationRules";
import { AuthCardShell, AuthCardHeader } from "@/components/auth/AuthCard";
import ForgotPasswordFlow from "@/components/auth/ForgotPasswordFlow";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import TextField from "@/components/auth/TextField";
import PasswordField from "@/components/auth/PasswordField";
import FormError from "@/components/auth/FormError";
import { usePageTitle } from "@/hooks/usePageTitle";

const Login = () => {
  usePageTitle("Log In");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const [submitError, setSubmitError] = useState(null);
  // Clicking "Forgot password?" used to navigate to /forgot-password.
  // It now swaps in <ForgotPasswordFlow> inside this same card instead
  // — the email/OTP form opens right here rather than on a separate
  // page.
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const onSubmit = async (formData) => {
    setSubmitError(null);

    try {
      const response = await loginUser(formData);
      const { user, token } = response.data.data;

      setAuth({ user, token });
      toast.success(response.data.message || "Login successful");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = getErrorMessage(error, "Failed to login");
      setSubmitError(message);
    }
  };

  if (isForgotPassword) {
    return (
      <AuthCardShell>
        <ForgotPasswordFlow onCancel={() => setIsForgotPassword(false)} onDone={() => setIsForgotPassword(false)} />
      </AuthCardShell>
    );
  }

  return (
    <AuthCardShell>
      <AuthCardHeader
        icon={<LogIn className="h-5 w-5" aria-hidden="true" />}
        title="Welcome back"
        subtitle="Log in to your RungtaStudentXchange account"
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7">
        <FormError message={submitError} />

        <div className="space-y-5">
          <TextField
            id="login-phone"
            label="Mobile number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            placeholder="9876543210"
            icon={<Phone className="h-4 w-4" aria-hidden="true" />}
            registration={register("phone", phoneRule)}
            error={errors.phone?.message}
          />

          <PasswordField
            id="login-password"
            label="Password"
            autoComplete="current-password"
            registration={register("password", passwordRule)}
            error={errors.password?.message}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsForgotPassword(true)}
              className="text-caption text-primary transition-colors duration-base ease-standard hover:text-primary-hover"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary btn-lg mt-7 h-12 w-full text-body font-semibold tracking-tight"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              Logging in…
            </>
          ) : (
            "Log In"
          )}
        </button>

        <p className="mt-6 text-center text-body-sm text-text-muted">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary transition-colors duration-base ease-standard hover:text-primary-hover"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthCardShell>
  );
};

export default Login;
