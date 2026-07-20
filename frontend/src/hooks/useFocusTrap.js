import { useEffect } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The accessible-overlay plumbing shared by every dialog-like surface
 * in the app: SlideOverPanel (nav/filter drawers) and Modal
 * (Report/Delete dialogs). Originally lived inline inside
 * SlideOverPanel; pulled out here so Modal doesn't reimplement the
 * same Tab-trap/Escape/scroll-lock logic a second time.
 *
 * `initialFocusRef` lets a caller choose what gets focus on open —
 * SlideOverPanel focuses its close button, a destructive confirm
 * dialog should focus "Cancel" (never the destructive action itself,
 * so an accidental Enter press can't confirm it). Falls back to the
 * first focusable element inside the container if not provided.
 */
export const useFocusTrap = ({ isOpen, onClose, containerRef, initialFocusRef }) => {
  useEffect(() => {
    if (!isOpen) return;

    const focusInitial = () => {
      // `preventScroll: true` is the important part here: without it,
      // focusing an element that's still mid-transition (translated
      // off-screen / off-canvas) makes mobile Chrome snap-scroll it
      // into view instantly, on top of the panel's own CSS transform
      // transition. Those two motions fighting each other is what
      // reads as a "jerk" when the drawer opens — the fix is just to
      // stop the browser from also trying to scroll.
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus({ preventScroll: true });
        return;
      }
      containerRef.current?.querySelector(FOCUSABLE_SELECTOR)?.focus({ preventScroll: true });
    };

    // Deferred one frame so the panel's opening transform transition
    // has already started compositing before we move focus. Moving
    // focus in the very same tick that the transform class flips can
    // still cause a layout/paint hiccup on lower-end Android devices
    // even with preventScroll, since focus itself forces a style
    // recalc; letting the browser paint the first animation frame
    // first keeps that recalc off the transition's critical path.
    const raf = requestAnimationFrame(focusInitial);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !containerRef.current) return;

      const focusable = containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, containerRef, initialFocusRef]);
};
