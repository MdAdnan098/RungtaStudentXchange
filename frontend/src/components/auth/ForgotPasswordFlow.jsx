import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { CheckCircle2, KeyRound, Mail, Phone, RotateCcw, ShieldCheck } from "lucide-react";
import { sendPasswordResetOtp, verifyPasswordResetOtp, resetPassword } from "@/api/passwordReset";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { phoneRule, emailRule, otpRule, passwordRule, confirmPasswordRule } from "@/utils/validationRules";
import { AuthCardHeader } from "@/components/auth/AuthCard";
import TextField from "@/components/auth/TextField";
import PasswordField from "@/components/auth/PasswordField";
import FormNote from "@/components/auth/FormNote";
import FormError from "@/components/auth/FormError";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const RESEND_COOLDOWN_S = 30;

/**
 * The mobile+email → OTP → new-password flow, factored out of
 * ForgotPassword.jsx so it can render *inline*, wherever "Forgot
 * password?" is clicked, instead of always navigating to a separate
 * /forgot-password page. That page still exists for guests who land
 * on it directly, but Login and the "Change Password" section on
 * Edit Profile both drop this component straight into their own
 * card instead of routing away — which also sidesteps a real bug:
 * /forgot-password sits behind GuestRoute, so a logged-in user
 * clicking a link to it was being bounced straight to "/".
 *
 * Same 3 steps, same API calls, same OTP/reset-token state machine as
 * before — only the surrounding chrome changed (AuthCardHeader
 * instead of the full AuthCard, since the caller already provides
 * its own card/section wrapper).
 *
 * `onCancel` — called for "never mind, I remember it" (back out
 * without finishing). `onDone` — called once the password has
 * actually been reset; the caller decides what happens next (Login
 * switches back to the login form so they can sign in with the new
 * password; Profile's Change Password section just collapses back
 * down since the user's already signed in).
 */
const ForgotPasswordFlow = ({ onCancel, onDone }) => {
  const [step, setStep] = useState("details"); // "details" | "otp" | "reset" | "done"
  const [submitError, setSubmitError] = useState(null);
  const [details, setDetails] = useState({ phone: "", email: "" });
  const [resetToken, setResetToken] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const detailsForm = useForm({ mode: "onBlur" });
  const otpForm = useForm({ mode: "onBlur" });
  const resetForm = useForm({ mode: "onBlur" });

  const startResendCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_S);
    const interval = setInterval(() => {
      setResendCooldown((seconds) => {
        if (seconds <= 1) {
          clearInterval(interval);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
  };

  const onSendOtp = async (formData) => {
    setSubmitError(null);
    try {
      const response = await sendPasswordResetOtp({ phone: formData.phone, email: formData.email });
      toast.success(response.data.message || "OTP sent");
      setDetails({ phone: formData.phone, email: formData.email });
      setStep("otp");
      startResendCooldown();
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "😕 Mobile number aur email match nahi kar rahe. Ek baar details dobara check karo.")
      );
    }
  };

  const onVerifyOtp = async (formData) => {
    setSubmitError(null);
    try {
      const response = await verifyPasswordResetOtp({
        phone: details.phone,
        email: details.email,
        otp: formData.otp,
      });
      setResetToken(response.data.data.resetToken);
      setStep("reset");
    } catch (error) {
      setSubmitError(getErrorMessage(error, "😕 OTP match nahi hua. Ek baar dobara check karke try karo."));
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const response = await sendPasswordResetOtp(details);
      toast.success(response.data.message || "OTP dobara bhej diya");
      startResendCooldown();
    } catch (error) {
      toast.error(getErrorMessage(error, "Resend nahi ho paaya, thodi der me try karo"));
    }
  };

  const onResetPassword = async (formData) => {
    setSubmitError(null);
    try {
      const response = await resetPassword({ resetToken, password: formData.password });
      toast.success(response.data.message || "🎉 Password successfully reset ho gaya!");
      setStep("done");
      setTimeout(() => onDone?.(), 1500);
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Password reset nahi ho paaya, dobara try karo"));
    }
  };

  if (step === "reset" || step === "done") {
    const isDone = step === "done";
    return (
      <div>
        <AuthCardHeader
          icon={isDone ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <KeyRound className="h-5 w-5" aria-hidden="true" />}
          title={isDone ? "You're all set!" : "Set a new password"}
          subtitle={isDone ? "Password updated ✅" : "OTP verify ho gaya ✅ Ab apna naya password choose kar lo."}
          stepIndex={3}
          stepCount={3}
        />
        <form onSubmit={resetForm.handleSubmit(onResetPassword)} noValidate className="mt-7">
          <FormError message={submitError} />

          <div className="space-y-5">
            <PasswordField
              id="reset-password-new"
              label="New password"
              placeholder="Naya password"
              registration={resetForm.register("password", passwordRule)}
              error={resetForm.formState.errors.password?.message}
            />

            <PasswordField
              id="reset-password-confirm"
              label="Confirm password"
              placeholder="Password dobara dalo"
              registration={resetForm.register(
                "confirmPassword",
                confirmPasswordRule(() => resetForm.getValues("password"))
              )}
              error={resetForm.formState.errors.confirmPassword?.message}
            />
          </div>

          <button
            type="submit"
            disabled={resetForm.formState.isSubmitting || isDone}
            className="btn-primary btn-lg mt-7 h-12 w-full text-body font-semibold tracking-tight"
          >
            {isDone ? (
              <>
                <LoadingSpinner size="sm" />
                Done…
              </>
            ) : resetForm.formState.isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                Resetting…
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div>
        <AuthCardHeader
          icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
          title="Check your inbox"
          subtitle="Enter the 6-digit code we just sent you"
          stepIndex={2}
          stepCount={3}
        />
        <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} noValidate className="mt-7">
          <FormError message={submitError} />

          <FormNote icon={<Mail className="h-4 w-4" aria-hidden="true" />}>
            📩 OTP tumhare email par bhej diya hai. Inbox (aur Spam folder bhi 😄) ek baar check kar lena.
          </FormNote>

          <TextField
            id="forgot-password-otp"
            label="Verification code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            otp
            registration={otpForm.register("otp", otpRule)}
            error={otpForm.formState.errors.otp?.message}
          />

          <button
            type="submit"
            disabled={otpForm.formState.isSubmitting}
            className="btn-primary btn-lg mt-7 h-12 w-full text-body font-semibold tracking-tight"
          >
            {otpForm.formState.isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                Verifying…
              </>
            ) : (
              "Verify OTP"
            )}
          </button>

          <div className="mt-5 flex items-center justify-between text-body-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="inline-flex items-center gap-1.5 text-primary transition-colors duration-base ease-standard hover:text-primary-hover disabled:cursor-not-allowed disabled:text-text-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("details");
                setSubmitError(null);
              }}
              className="text-text-muted transition-colors duration-base ease-standard hover:text-text"
            >
              Change details
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <AuthCardHeader
        icon={<KeyRound className="h-5 w-5" aria-hidden="true" />}
        title="Forgot password?"
        subtitle="No tension — verify your details and we'll send you a reset code"
        stepIndex={1}
        stepCount={3}
      />
      <form onSubmit={detailsForm.handleSubmit(onSendOtp)} noValidate className="mt-7">
        <FormError message={submitError} />

        <FormNote>
          Apna registered mobile number aur email dalo. Dono match hote hi hum ek OTP bhej denge — 30 second se bhi
          kam lagega 🙂
        </FormNote>

        <div className="space-y-5">
          <TextField
            id="forgot-password-phone"
            label="Mobile number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            placeholder="Registered mobile number"
            icon={<Phone className="h-4 w-4" aria-hidden="true" />}
            registration={detailsForm.register("phone", phoneRule)}
            error={detailsForm.formState.errors.phone?.message}
          />

          <TextField
            id="forgot-password-email"
            label="Recovery email"
            type="email"
            autoComplete="email"
            placeholder="Registration ke time wala email"
            icon={<Mail className="h-4 w-4" aria-hidden="true" />}
            registration={detailsForm.register("email", emailRule)}
            error={detailsForm.formState.errors.email?.message}
          />
        </div>

        <button
          type="submit"
          disabled={detailsForm.formState.isSubmitting}
          className="btn-primary btn-lg mt-7 h-12 w-full text-body font-semibold tracking-tight"
        >
          {detailsForm.formState.isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              Sending…
            </>
          ) : (
            "Send OTP"
          )}
        </button>

        {onCancel && (
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

export default ForgotPasswordFlow;
