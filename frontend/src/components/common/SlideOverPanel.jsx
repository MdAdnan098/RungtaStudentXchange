import { useRef } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/utils/cn";

/**
 * The generic shell behind MobileNav (site navigation), FilterDrawer
 * (Browse's mobile filters), and now nothing else added by this task
 * — Product Details' Report/Delete dialogs use the centered `Modal`
 * component instead, since a slide-over reads wrong for a focused
 * confirm/report action. Shell logic (focus trap, Escape, backdrop)
 * lives in useFocusTrap, shared by both.
 */
const SlideOverPanel = ({ isOpen, onClose, title, ariaLabel, footer, children, widthClassName = "w-80" }) => {
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);

  useFocusTrap({ isOpen, onClose, containerRef: panelRef, initialFocusRef: closeButtonRef });

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-overlay bg-gray-950/60 backdrop-blur-[2px] transition-opacity duration-base ease-standard md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn(
          "fixed inset-y-0 right-0 z-modal flex h-full max-w-[85vw] flex-col",
          widthClassName,
          "bg-surface-raised shadow-xl",
          "transition-transform duration-base ease-standard will-change-transform md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <span className="text-body-sm font-display font-semibold text-text">{title}</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text transition-colors duration-base ease-standard"
            aria-label={`Close ${title?.toLowerCase() || "panel"}`}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">{children}</div>

        {footer && <div className="border-t border-border px-4 py-3">{footer}</div>}
      </div>
    </>
  );
};

export default SlideOverPanel;
