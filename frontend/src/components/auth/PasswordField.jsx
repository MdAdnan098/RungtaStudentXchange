import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

/**
 * Single shared password input for every auth form (Login, Register,
 * Forgot Password / Reset Password, Admin Login/Register). Same
 * consolidation as TextField.jsx — one component instead of three
 * near-identical copies. Every password field now gets the same lock
 * icon, height, and eye-toggle treatment for free.
 *
 * `onFocus`/`onBlur` are layered on top of (not replacing) react-hook-
 * form's own `onBlur` from `registration`, kept for any page that
 * wants privacy-mode-style focus handling later.
 */
const PasswordField = ({ id, label, registration, error, placeholder, onFocus, onBlur, autoComplete = "current-password" }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-2 block text-body-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        >
          <Lock className="h-4 w-4" />
        </span>
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`input py-3 pl-11 pr-11 ${error ? "input-error" : ""}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...registration}
          onFocus={onFocus}
          onBlur={(event) => {
            registration?.onBlur?.(event);
            onBlur?.(event);
          }}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center
            rounded-md text-text-muted transition-colors duration-base ease-standard
            hover:bg-surface-hover hover:text-text"
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-caption text-danger-text">
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordField;
