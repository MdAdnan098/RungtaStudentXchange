import { useCallback, useEffect, useState } from "react";
import { trackVisit } from "@/api/visitors";
import { parseUserAgent } from "@/utils/parseUserAgent";
import { VISITOR_DIALOG_SHOWN_KEY, VISITOR_PERMISSION_STATUS_KEY, VISITOR_SESSION_TRACKED_KEY } from "@/constants";

/**
 * Drives the landing-page visitor-location flow. Permission and
 * tracking are two different things, handled on two different
 * schedules:
 *
 *   - The custom consent dialog, and the real browser geolocation
 *     permission popup it can trigger, are shown AT MOST ONCE EVER
 *     per browser/device (VISITOR_DIALOG_SHOWN_KEY in localStorage).
 *     Never again after that — not in a new tab, not in a new
 *     session tomorrow, not after logging in.
 *   - A visitor record (POST /visitors/track) is sent ONCE PER TAB
 *     SESSION (VISITOR_SESSION_TRACKED_KEY in sessionStorage):
 *     revisiting the landing page several times in the same tab (via
 *     the navbar, back button, etc.) must not save a new record every
 *     time, but closing the tab/browser and opening the link again
 *     must. Once permission has already been granted, that one
 *     per-session record is read silently — no dialog, no browser
 *     popup, since a permission the browser already granted can be
 *     read again without prompting.
 *
 * VISITOR_PERMISSION_STATUS_KEY remembers what the visitor decided
 * the one time they were asked, so every later tab session knows —
 * without asking again — what's safe to do:
 *
 *   - "granted"   → silently read a fresh position this session (no
 *                   popup, permission is already granted). If the
 *                   device's location/GPS service happens to be off
 *                   this time, only THAT session's record is logged
 *                   as "unavailable" — the remembered "granted"
 *                   status itself never changes because of one bad
 *                   read.
 *   - "denied"    → never call geolocation again (the browser
 *                   remembers the denial anyway); log the visit as
 *                   "denied", no coordinates.
 *   - "dismissed" → the visitor clicked "Not Now", so the real
 *                   browser permission was never actually requested;
 *                   never call geolocation (that WOULD trigger the
 *                   popup for the first time) — log the visit as
 *                   "dismissed".
 */
export const useVisitorTracking = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const send = useCallback((permissionStatus, coords) => {
    const { browser, operatingSystem, deviceType } = parseUserAgent();

    trackVisit({
      permissionStatus,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      browser,
      operatingSystem,
      deviceType,
    }).catch(() => {
      // Best-effort background analytics call — never surface this
      // to the visitor (see api/visitors.js).
    });
  }, []);

  // Silently reads a fresh position on an already-granted permission.
  // Never shows a browser popup — that decision was already made the
  // one time the visitor was asked.
  const readAndSend = useCallback(() => {
    if (!navigator.geolocation) {
      send("unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        send("granted", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      // Device location/GPS off, timeout, or revoked mid-session —
      // this single visit just has no coordinates.
      () => send("unavailable"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [send]);

  useEffect(() => {
    // Already saved a record for this tab session (an earlier visit
    // to the landing page in this same tab) — do nothing at all, no
    // dialog, no read, no send. Set synchronously right away, before
    // any async work, so a second effect run (route back to "/", or
    // React StrictMode's double-invoke in dev) can never double-fire.
    if (sessionStorage.getItem(VISITOR_SESSION_TRACKED_KEY)) return;
    sessionStorage.setItem(VISITOR_SESSION_TRACKED_KEY, "1");

    const alreadyShown = localStorage.getItem(VISITOR_DIALOG_SHOWN_KEY);

    if (!alreadyShown) {
      // First visit ever on this browser/device — ask once.
      setIsDialogOpen(true);
      return;
    }

    // Dialog already answered on a previous tab session: never show
    // it again, never trigger the browser popup — just silently
    // record this session using whatever was decided the first time.
    const priorStatus = localStorage.getItem(VISITOR_PERMISSION_STATUS_KEY);

    if (priorStatus === "granted") {
      readAndSend();
    } else {
      send(priorStatus || "dismissed");
    }
  }, [readAndSend, send]);

  const handleAllow = useCallback(() => {
    setIsDialogOpen(false);
    localStorage.setItem(VISITOR_DIALOG_SHOWN_KEY, "1");

    if (!navigator.geolocation) {
      localStorage.setItem(VISITOR_PERMISSION_STATUS_KEY, "denied");
      send("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        localStorage.setItem(VISITOR_PERMISSION_STATUS_KEY, "granted");
        send("granted", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        localStorage.setItem(VISITOR_PERMISSION_STATUS_KEY, "denied");
        send("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [send]);

  const handleNotNow = useCallback(() => {
    setIsDialogOpen(false);
    localStorage.setItem(VISITOR_DIALOG_SHOWN_KEY, "1");
    localStorage.setItem(VISITOR_PERMISSION_STATUS_KEY, "dismissed");
    send("dismissed");
  }, [send]);

  return { isDialogOpen, handleAllow, handleNotNow };
};
