import { useRef } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/utils/cn";

/**
 * Centered dialog — distinct from SlideOverPanel (which slides in
 * from the edge for navigation/filters). A confirm/report action
 * reads better as a focused, centered interruption than a drawer.
 *
 * `initialFocusRef` is passed straight through to useFocusTrap — for
 * DeleteConfirmDialog this is the Cancel button, never the
 * destructive action, so an accidental Enter can't confirm it.
 */
const Modal = ({ isOpen, onClose, titleId, initialFocusRef, maxWidthClass = "max-w-md", children }) => {
  const panelRef = useRef(null);

  useFocusTrap({ isOpen, onClose, containerRef: panelRef, initialFocusRef });

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "modal-panel inset-0 m-auto h-fit max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] overflow-y-auto",
          maxWidthClass
        )}
      >
        {children}
      </div>
    </>
  );
};

/**
 * Optional shared header — title + close button — most callers want
 * this exact layout, but it's not baked into Modal itself so a
 * caller can skip it (e.g. a dialog that only needs body + footer).
 */
export const ModalHeader = ({ titleId, title, onClose }) => (
  <div className="mb-4 flex items-start justify-between gap-4">
    <h2 id={titleId} className="text-h5">
      {title}
    </h2>
    <button
      type="button"
      onClick={onClose}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text transition-colors duration-base ease-standard"
      aria-label="Close dialog"
    >
      <X className="h-5 w-5" aria-hidden="true" />
    </button>
  </div>
);

export default Modal;
