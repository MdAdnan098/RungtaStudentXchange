// Turns a lat/lng pair into { country, state, district, area, city }
// using OpenStreetMap's Nominatim reverse-geocoding API. Chosen over
// the Google Geocoding API because it needs no API key / billing
// setup — important for a student project — at the cost of being a
// public, rate-limited service (usage policy: max ~1 request/sec, a
// descriptive User-Agent is required). That's fine here since this
// only runs once per landing-page visit per visitor (see
// frontend/src/hooks/useVisitorTracking.js), not per pageview.
//
// zoom=18 (building level) so addressdetails comes back with the
// full admin hierarchy down to suburb/neighbourhood — needed so the
// admin Visitor Map can show state names zoomed out, district names
// zoomed in, and area names zoomed in further, the same way an
// actual map's place labels change with zoom level.
//
// Never throws — a failed/timed-out lookup just resolves to nulls so
// it can't block or break the visit-tracking write.
export const reverseGeocode = async (latitude, longitude) => {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return { country: null, state: null, district: null, area: null, city: null };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "RungtaStudentXchange/1.0 (student marketplace visitor analytics)",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      return { country: null, state: null, district: null, area: null, city: null };
    }

    const data = await response.json();
    const address = data?.address || {};

    return {
      country: address.country || null,
      state: address.state || null,
      // "District" — the admin level between state and city (e.g.
      // Indian revenue districts).
      district: address.state_district || address.county || null,
      // "Area" — neighbourhood-level, the finest label worth showing
      // on the map.
      area: address.suburb || address.neighbourhood || address.city_district || null,
      city: address.city || address.town || address.village || address.county || null,
    };
  } catch (error) {
    return { country: null, state: null, district: null, area: null, city: null };
  }
};
