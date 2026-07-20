import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, BadgeCheck, ShieldCheck } from "lucide-react";
import { sendOtp, verifyOtp, resendOtp } from "@/api/otp";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { rungtaEmailRule } from "@/utils/validationRules";
import TextField from "@/components/auth/TextField";
import FormError from "@/components/auth/FormError";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const RESEND_COOLDOWN_S = 30;

// Kept local (rather than editing the shared otpRule in
// validationRules.js) so this card's Hinglish copy doesn't leak into
// ForgotPassword, which also uses otpRule but wasn't part of this
// request.
const otpRuleHinglish = {
  required: "OTP dalna zaroori hai",
  pattern: { value: /^\d{6}$/, message: "OTP 6 digit ka hona chahiye" },
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
      toast.success(response.data.message || "OTP bhej diya");
      setSentToEmail(formData.email);
      setStep("otp");
      startResendCooldown();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "OTP nahi bhej paaye, dobara try karo"));
    }
  };

  const onVerifyOtp = async (formData) => {
    setSubmitError(null);
    try {
      const response = await verifyOtp({ email: sentToEmail, otp: formData.otp });
      setUser(response.data.data.user);
      toast.success("Verified! Ab tum officially Verified Rungta Student ho.");
    } catch (error) {
      setSubmitError(getErrorMessage(error, "OTP match nahi hua. Ek baar dobara check karke try karo."));
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const response = await resendOtp({ email: sentToEmail });
      toast.success(response.data.message || "OTP dobara bhej diya");
      startResendCooldown();
    } catch (error) {
      toast.error(getErrorMessage(error, "Resend nahi ho paaya, thodi der me try karo"));
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
            <h2 className="text-h5 leading-snug">😕 Abhi tum guest ke roop mein browse kar rahe ho.</h2>
            <p className="mt-2 max-w-lg text-body-sm leading-relaxed text-text-muted">
              🛡️ Verified Student badge se buyers aur sellers ke beech trust banta hai aur marketplace sabke liye
              zyada safe ho jaata hai.
            </p>
            <p className="mt-2 max-w-lg text-body-sm leading-relaxed text-text-muted">
              Pehle apna account banao, phir apni official Rungta Student Email ID se verify kar lo.
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <Link to="/register" className="btn-primary w-full sm:w-auto">
            Account Banao &amp; Verify Karo
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
            <h2 className="text-h5 leading-snug">✅ Tum ek Verified Student ho.</h2>
            <span className="badge-success">Verified</span>
          </div>
          <p className="mt-2 max-w-lg text-body-sm leading-relaxed text-text-muted">
            🎉 RungtaStudentXchange ko sabke liye ek trusted marketplace banane mein tumhari yeh help bahut
            matter karti hai. Shukriya!
          </p>
        </div>
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
            🛡️ Verified Student badge se doosre students ko tumhare profile par bharosa hota hai aur
            buying-selling zyada safe ho jaati hai. Bas ek minute ka kaam hai.
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
              placeholder="Apna Rungta email dalo (example: yourERP@rungta.org)"
              registration={emailForm.register("email", rungtaEmailRule)}
              error={emailForm.formState.errors.email?.message}
            />

            <button
              type="submit"
              disabled={emailForm.formState.isSubmitting}
              className="btn-primary mt-4 w-full sm:w-auto"
            >
              {emailForm.formState.isSubmitting && <LoadingSpinner size="sm" />}
              {emailForm.formState.isSubmitting ? "Bhej rahe hain…" : "OTP Bhejo"}
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
                {otpForm.formState.isSubmitting ? "Verify ho raha hai…" : "Verify Karo"}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-body-sm text-primary hover:text-primary-hover transition-colors duration-base ease-standard disabled:cursor-not-allowed disabled:text-text-muted"
              >
                {resendCooldown > 0 ? `${resendCooldown}s mein dobara bhejo` : "Code Dobara Bhejo"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setSubmitError(null);
                }}
                className="text-body-sm text-text-muted hover:text-text transition-colors duration-base ease-standard"
              >
                Email badlo
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentVerificationCard;
