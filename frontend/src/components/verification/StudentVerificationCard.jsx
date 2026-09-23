import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, BadgeCheck, ShieldCheck } from "lucide-react";
import { sendOtp, verifyOtp, resendOtp } from "@/api/otp";
import { revokeMyVerification } from "@/api/users";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { rungtaEmailRule } from "@/utils/validationRules";
import TextField from "@/components/auth/TextField";
import FormError from "@/components/auth/FormError";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Modal, { ModalHeader } from "@/components/common/Modal";

const RESEND_COOLDOWN_S = 30;

// Kept local (rather than editing the shared otpRule in
// validationRules.js) so this card's Hinglish copy doesn't leak into
// ForgotPassword, which also uses otpRule but wasn't part of this
// request.
const otpRuleHinglish = {
  required: "OTP is required.",
  pattern: { value: /^\d{6}$/, message: "OTP must be 6 digits." },
};

/**
 * Reuses the existing OTP backend (POST /otp/send, /otp/verify,
 * /otp/resend with purpose "studentVerify") — this card is just a
 * dedicated, reusable frontend home for that flow (rendered on both
 * the dashboard and the landing page), separate from registration.
 *
 * Renders one of three states depending on who's looking at it:
 *  - guest (not logged in)       → CTA to Register, no form
 *  - logged in, not yet verified → existing email → OTP form
 *  - logged in, already verified → success state
 */
const StudentVerificationCard = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [step, setStep] = useState("email"); // "email" | "otp"
  const [submitError, setSubmitError] = useState(null);
  const [sentToEmail, setSentToEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
const [isRevoking, setIsRevoking] = useState(false);

  const emailForm = useForm({ mode: "onBlur" });
  const otpForm = useForm({ mode: "onBlur" });

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
      const response = await sendOtp({ email: formData.email });
      toast.success(response.data.message || "OTP sent successfully!");
      setSentToEmail(formData.email);
      setStep("otp");
      startResendCooldown();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Failed to send OTP. Please try again."));
    }
  };

  const onVerifyOtp = async (formData) => {
    setSubmitError(null);
    try {
      const response = await verifyOtp({ email: sentToEmail, otp: formData.otp });
      setUser(response.data.data.user);
      toast.success("Verified! Now you are officially Verified Rungta Student.");
    } catch (error) {
      setSubmitError(getErrorMessage(error, "The OTP you entered is incorrect. Please try again."));
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const response = await resendOtp({ email: sentToEmail });
      toast.success(response.data.message || "OTP has been resent.");
      startResendCooldown();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to resend OTP. Please try again in a moment."));
    }
  };

  const handleRevoke = async () => {
  setIsRevoking(true);
  try {
    const response = await revokeMyVerification();
    setUser(response.data.data.user);
    toast.success("Verification removed.");
    setShowRevokeConfirm(false);
  } catch (error) {
    toast.error(getErrorMessage(error, "Failed to remove verification. Please try again."));
  } finally {
    setIsRevoking(false);
  }
};

  // ── Guest (not logged in) ───────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="card-padded">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-subtle-text">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-h5 leading-snug">😕 Abhi tum as a guest browse kar rahe ho.</h2>
            <p className="mt-2 max-w-lg text-body-sm leading-relaxed text-text-muted">
              First, create your account, then verify it using your official Rungta student email ID.
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <Link to="/register" className="btn-primary w-full sm:w-auto">
            Create &amp Verify Your Account
          </Link>
        </div>
      </div>
    );
  }

  // ── Already verified ────────────────────────────────────────────
  if (user?.isStudentVerified) {
    return (
      <div className="card-padded flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success-subtle text-success-text">
          <BadgeCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-h5 leading-snug">Now you are Verified R1 Student</h2>
            <span className="badge-success">Verified</span>
          </div>
          <p className="mt-2 max-w-lg text-body-sm leading-relaxed text-text-muted">
            🎉 RungtaStudentXchange ko sabke liye ek trusted marketplace banane mein tumhari yeh help bahut
            matter karti hai. Shukriya!
          </p>

          <button
            type="button"
            onClick={() => setShowRevokeConfirm(true)}
            className="mt-4 text-body-sm text-text-muted hover:text-danger-text transition-colors duration-base ease-standard"
          >
            Remove verification
          </button>
        </div>

        <Modal isOpen={showRevokeConfirm} onClose={() => setShowRevokeConfirm(false)} titleId="revoke-verify-title">
          <ModalHeader
            titleId="revoke-verify-title"
            title="Remove your Verified Student badge?"
            onClose={() => setShowRevokeConfirm(false)}
          />
          <p className="text-body-sm text-text-muted">
            You'll lose the Verified badge and need to re-verify with your Rungta email again later if you want it back.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowRevokeConfirm(false)}
              className="btn-ghost !rounded-xl btn-tactile"
              disabled={isRevoking}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRevoke}
              className="btn-danger !rounded-xl shadow-sm btn-tactile hover:shadow-md"
              disabled={isRevoking}
            >
              {isRevoking && <LoadingSpinner size="sm" />}
              {isRevoking ? "Removing…" : "Remove verification"}
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  // ── Verification form (email → OTP) ─────────────────────────────
  return (
    <div className="card-padded">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger-subtle text-danger-text">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-h5 leading-snug">😕 Tumne abhi tak apni Rungta Student Email ID se verify nahi kiya hai.</h2>
          <p className="mt-2 max-w-lg text-body-sm leading-relaxed text-text-muted">
            🛡️ The Verified Student badge helps build trust with other students and makes buying and selling safer. It only takes a minute.
          </p>
        </div>
      </div>

      <div className="mt-5 max-w-sm border-t border-border pt-5">
        <FormError message={submitError} />

        {step === "email" && (
          <form onSubmit={emailForm.handleSubmit(onSendOtp)} noValidate>
            <TextField
              id="student-verify-email"
              label="Rungta Email"
              type="email"
              autoComplete="off"
              placeholder="Rungta email (e.g., yourERP@rungta.org)"
              registration={emailForm.register("email", rungtaEmailRule)}
              error={emailForm.formState.errors.email?.message}
            />

            <button
              type="submit"
              disabled={emailForm.formState.isSubmitting}
              className="btn-primary mt-4 w-full sm:w-auto"
            >
              {emailForm.formState.isSubmitting && <LoadingSpinner size="sm" />}
              {emailForm.formState.isSubmitting ? "Sending…" : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} noValidate>
            <p className="mb-3 text-body-sm text-text-muted">
              OTP tumhare Rungta email par bhej diya hai. Inbox (aur Spam folder bhi) ek baar check kar lena.
            </p>

            <TextField
              id="student-verify-otp"
              label="OTP Code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              registration={otpForm.register("otp", otpRuleHinglish)}
              error={otpForm.formState.errors.otp?.message}
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={otpForm.formState.isSubmitting}
                className="btn-primary sm:w-auto"
              >
                {otpForm.formState.isSubmitting && <LoadingSpinner size="sm" />}
                {otpForm.formState.isSubmitting ? "Verifying…" : "Verify"}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-body-sm text-primary hover:text-primary-hover transition-colors duration-base ease-standard disabled:cursor-not-allowed disabled:text-text-muted"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setSubmitError(null);
                }}
                className="text-body-sm text-text-muted hover:text-text transition-colors duration-base ease-standard"
              >
                Change Email Id
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentVerificationCard;
