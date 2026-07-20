import { AlertCircle } from "lucide-react";

/**
 * For submit-time errors from the backend (invalid credentials,
 * "account already exists", rate limits, ...) — as opposed to
 * per-field client-side validation, which react-hook-form renders
 * inline under each input via `.field-error`.
 */
const FormError = ({ message, className = "" }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`mb-5 flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger-subtle px-3.5 py-3 text-body-sm leading-relaxed text-danger-text ${className}`}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};

export default FormError;
