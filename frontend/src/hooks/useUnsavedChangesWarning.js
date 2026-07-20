import { useEffect } from "react";

/**
 * Covers browser refresh/close-tab/back-to-a-different-site via the
 * native `beforeunload` prompt — reliable, needs no router support.
 *
 * Does NOT intercept in-app navigation (clicking the Navbar logo,
 * another <Link>, etc.) — React Router's `useBlocker` /
 * `unstable_usePrompt` are what that requires, and both only work
 * under a Data Router (`createBrowserRouter` + `RouterProvider`).
 * This app uses `<BrowserRouter>` (established in Task 1's
 * foundation), so those APIs aren't available here, and switching
 * routers app-wide is out of scope for a form-level feature. The
 * practical mitigation is ProductForm's own "Cancel" button, which
 * checks `isDirty` itself and confirms before navigating away — that
 * covers the primary in-form exit path even though a stray click on
 * global nav mid-edit isn't caught.
 */
export const useUnsavedChangesWarning = (isDirty) => {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // required for the confirm dialog in most browsers
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
};
