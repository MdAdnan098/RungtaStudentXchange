import { useRef } from "react";
import { MapPin } from "lucide-react";
import Modal, { ModalHeader } from "@/components/common/Modal";

const TITLE_ID = "location-consent-title";

/**
 * Shown at most once ever per browser/device on the landing page,
 * before the actual browser geolocation permission popup — see
 * useVisitorTracking.js. Wording is deliberately specific about what
 * is collected (precise GPS coordinates, linked to the account when
 * logged in, visible to admins) rather than a vague "improve our
 * services" line, so consent here is actually informed.
 */
const LocationConsentDialog = ({ isOpen, onAllow, onNotNow }) => {
  const primaryButtonRef = useRef(null);

  return (
    <Modal isOpen={isOpen} onClose={onNotNow} titleId={TITLE_ID} initialFocusRef={primaryButtonRef}>
      <ModalHeader titleId={TITLE_ID} title="Help Us Improve 😊" onClose={onNotNow} />

      <div className="mb-2 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary-subtle-text">
          <MapPin className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-body-sm text-text-muted">
          Help us understand our visitor reach across different cities and regions. This information will only be used for analytics and improving our services.        </p>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onNotNow} className="btn-ghost">
          Not Now
        </button>
        <button ref={primaryButtonRef} type="button" onClick={onAllow} className="btn-primary">
          OK
        </button>
      </div>
    </Modal>
  );
};

export default LocationConsentDialog;
