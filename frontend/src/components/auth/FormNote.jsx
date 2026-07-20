import { Info } from "lucide-react";

const TONE_STYLES = {
  info: "bg-primary-subtle text-primary-subtle-text",
  warning: "border border-warning/20 bg-warning-subtle text-warning-text",
};

/**
 * Shared helper/notice banner for auth forms — used for things like
 * "we'll only ask for this email once" or "OTP sent, check spam".
 * `tone="info"` (default) reads as a supportive tip; `tone="warning"`
 * is reserved for genuinely cautionary notices (e.g. a missing reset
 * token) so it doesn't get diluted by overuse.
 */
const FormNote = ({ icon, tone = "info", children }) => {
  return (
    <div className={`mb-5 flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-body-sm leading-relaxed ${TONE_STYLES[tone]}`}>
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {icon || <Info className="h-4 w-4" />}
      </span>
      <span>{children}</span>
    </div>
  );
};

export default FormNote;
