import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserCog } from "lucide-react";
import { registerAdmin } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { usernameRule, passwordRule, confirmPasswordRule } from "@/utils/validationRules";
import AuthCard from "@/components/auth/AuthCard";
import TextField from "@/components/auth/TextField";
import PasswordField from "@/components/auth/PasswordField";
import FormError from "@/components/auth/FormError";
import LoadingSpinner from "@/components/common/LoadingSpinner";

/**
 * Creates an admin account with just a username + password — no
 * name, email, or OTP step (that flow is for student accounts only,
 * see Register.jsx). Hits POST /auth/admin/register, which the
 * backend gates behind ADMIN_REGISTER_SECRET (set in .env) so random
 * visitors can't self-promote to admin; the "Admin key" field below
 * is that secret.
 */
const AdminRegister = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const [submitError, setSubmitError] = useState(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    setSubmitError(null);

    try {
      const response = await registerAdmin({
        username: formData.username,
        password: formData.password,
        adminSecret: formData.adminSecret,
      });
      const { user, token } = response.data.data;

      setAuth({ user, token });
      toast.success(response.data.message || "Admin account created");
      navigate("/admin", { replace: true });
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Failed to create admin account"));
    }
  };

  return (
    <AuthCard
      icon={<UserCog className="h-5 w-5" aria-hidden="true" />}
      title="Create Admin Account"
      subtitle="Username and password only — no email needed"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormError message={submitError} />

        <div className="space-y-5">
          <TextField
            id="admin-register-username"
            label="Username"
            autoComplete="username"
            placeholder="admin_username"
            registration={register("username", usernameRule)}
            error={errors.username?.message}
          />

          <PasswordField
            id="admin-register-password"
            label="Password"
            autoComplete="new-password"
            registration={register("password", passwordRule)}
            error={errors.password?.message}
          />

          <PasswordField
            id="admin-register-confirm-password"
            label="Confirm password"
            autoComplete="new-password"
            registration={register("confirmPassword", confirmPasswordRule(() => getValues("password")))}
            error={errors.confirmPassword?.message}
          />

          <PasswordField
            id="admin-register-secret"
            label="Admin key"
            autoComplete="off"
            placeholder="Provided separately by the project owner"
            registration={register("adminSecret", { required: "Admin key is required" })}
            error={errors.adminSecret?.message}
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
              Creating account…
            </>
          ) : (
            "Create Admin Account"
          )}
        </button>

        <p className="mt-6 text-center text-body-sm text-text-muted">
          Already have an admin account?{" "}
          <Link
            to="/admin/login"
            className="font-medium text-primary transition-colors duration-base ease-standard hover:text-primary-hover"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default AdminRegister;
