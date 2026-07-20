/**
 * Every backend error response (validation, auth, rate-limit, 500s —
 * see backend/middleware/errorHandler.js and every controller's catch
 * block) is shaped `{ success: false, message, data: null }`. This
 * pulls that message out with sensible fallbacks, so every form in
 * the app displays backend errors the same way instead of each
 * catch block re-deriving this.
 */
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error) return fallback;

  // Network failure (no response at all — server down, no connection).
  if (!error.response) {
    return "Can't reach the server right now. Check your connection and try again.";
  }

  return error.response.data?.message || fallback;
};
