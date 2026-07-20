// These mirror the backend's constants (backend/constants/*.js) so the
// frontend never invents values the API doesn't accept.

export const CATEGORIES = [
  "Books",
  "Electronics",
  "Cycles",
  "Calculators",
  "Furniture",
  "Lab Equipment",
  "Stationery",
  "Clothing",
  "Sports",
  "Miscellaneous",
];

export const CONDITIONS = ["new", "like new", "good", "fair"];

export const REPORT_REASONS = ["spam", "misleading", "prohibited", "duplicate", "other"];

export const PRODUCT_STATUS = ["active", "sold", "removed"];

export const USER_ROLES = ["user", "admin"];

// Key used to persist the auth token + user in localStorage via the
// zustand persist middleware (see src/store/authStore.js)
export const AUTH_STORAGE_KEY = "rsx-auth";

// Key used to persist the theme preference in localStorage via the
// zustand persist middleware (see src/store/themeStore.js). Also read
// directly (outside React) by the inline script in index.html to set
// the correct theme class before first paint.
export const THEME_STORAGE_KEY = "rsx-theme";

// Two localStorage keys (not sessionStorage — deliberately persist
// across tabs/sessions/logins) that drive the landing-page visitor
// location flow. See src/hooks/useVisitorTracking.js for the full
// flow — in short: the consent dialog + real browser permission
// popup are shown at most once ever per browser/device; the
// visitor's location is then recorded once per tab session after
// that, silently, using whatever was decided the first time.

// Set the first (and only) time the consent dialog is shown/answered.
// Once set, the dialog and the real browser permission popup never
// appear again on this browser/device.
export const VISITOR_DIALOG_SHOWN_KEY = "rsx-visitor-dialog-shown";

// Remembers what the visitor decided that one time: "granted",
// "denied", or "dismissed". Read (never re-prompted) on every later
// visit to decide whether it's safe to silently read a fresh
// position for that visit.
export const VISITOR_PERMISSION_STATUS_KEY = "rsx-visitor-permission-status";

// sessionStorage (deliberately — clears when the tab/browser closes)
// key that caps location tracking at once per tab session: revisiting
// the landing page several times in the SAME tab must not save a new
// visitor record each time, but a fresh tab/browser session must.
export const VISITOR_SESSION_TRACKED_KEY = "rsx-visitor-session-tracked";
