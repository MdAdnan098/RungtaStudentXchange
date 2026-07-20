import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import { loginAdmin } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { usernameRule, passwordRule } from "@/utils/validationRules";
import AuthCard from "@/components/auth/AuthCard";
import TextField from "@/components/auth/TextField";
import PasswordField from "@/components/auth/PasswordField";
import FormError from "@/components/auth/FormError";
import LoadingSpinner from "@/components/common/LoadingSpinner";

/**
 * Separate from the student Login page on purpose — admins sign in
 * with a username + password only, no email/OTP involved. Hits
 * POST /auth/admin/login (backend only matches users with
 * role: "admin"), then redirects into /admin like any other
 * successful login.
 */
const AdminLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const [submitError, setSubmitError] = useState(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    setSubmitError(null);

    try {
      const response = await loginAdmin(formData);
      const { user, token } = response.data.data;

      setAuth({ user, token });
      toast.success(response.data.message || "Login successful");
      navigate("/admin", { replace: true });
    } catch (error) {
      const message = getErrorMessage(error, "Failed to login");
      setSubmitError(message);
    }
  };

  return (
    <AuthCard
      icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
      title="Admin Login"
      subtitle="Sign in with your admin username and password"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormError message={submitError} />

        <div className="space-y-5">
          <TextField
            id="admin-login-username"
            label="Username"
            autoComplete="username"
            placeholder="admin_username"
            registration={register("username", usernameRule)}
            error={errors.username?.message}
          />

          <PasswordField
            id="admin-login-password"
            label="Password"
            autoComplete="current-password"
            registration={register("password", passwordRule)}
            error={errors.password?.message}
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
              Logging in…
            </>
          ) : (
            "Log In"
          )}
        </button>

        <p className="mt-6 text-center text-body-sm text-text-muted">
          Need an admin account?{" "}
          <Link
            to="/admin/register"
            className="font-medium text-primary transition-colors duration-base ease-standard hover:text-primary-hover"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default AdminLogin;
