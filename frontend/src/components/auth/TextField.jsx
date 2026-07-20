/**
 * Single shared text input for every auth/profile form (Login,
 * Register, Forgot Password, OTP, Admin Login/Register, Profile
 * Edit). Consolidated from what used to be three near-identical
 * copies (this one, plus page-specific versions for Login/Register
 * and the recovery flow) into one — same `.input` tokens (border,
 * surface, hover/focus/error states) as before, now with an optional
 * leading icon and a slightly taller, more comfortable height applied
 * everywhere at once.
 *
 * `icon` and `otp` are both optional and back-compatible: existing
 * callers that don't pass them keep rendering a plain input, just
 * with the shared height/spacing refinement.
 */
const TextField = ({ id, label, type = "text", icon, otp = false, registration, error, ...props }) => {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-2 block text-body-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          className={`input py-3 ${icon ? "pl-11" : ""} ${
            otp ? "text-center text-lg font-semibold font-mono tracking-[0.5em]" : ""
          } ${error ? "input-error" : ""}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...registration}
          {...props}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-caption text-danger-text">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextField;
