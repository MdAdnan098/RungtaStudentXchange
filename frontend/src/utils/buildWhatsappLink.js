// Builds a wa.me deep link for contacting a seller about a listing.
// Numbers are stored as plain 10-digit strings (see Product model);
// wa.me needs the country code prefixed — defaulting to +91 (India)
// since this marketplace is for students on Indian campuses.
const COUNTRY_CODE = "91";

export const buildWhatsappLink = (whatsappNumber, productTitle) => {
  if (!whatsappNumber) return null;

  const message = `Hi! I'm interested in your listing "${productTitle}" on RungtaStudentXchange.`;
  return `https://wa.me/${COUNTRY_CODE}${whatsappNumber}?text=${encodeURIComponent(message)}`;
};
