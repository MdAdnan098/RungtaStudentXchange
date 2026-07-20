const UNITS = [
  { limit: 60, divisor: 1, unit: "second" },
  { limit: 3600, divisor: 60, unit: "minute" },
  { limit: 86400, divisor: 3600, unit: "hour" },
  { limit: 604800, divisor: 86400, unit: "day" },
  { limit: 2629800, divisor: 604800, unit: "week" },
  { limit: 31557600, divisor: 2629800, unit: "month" },
  { limit: Infinity, divisor: 31557600, unit: "year" },
];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/**
 * Product.createdAt is an ISO timestamp (Mongoose `timestamps: true`).
 * This renders it as "2 days ago" / "just now" for the product card's
 * "Posted time" field.
 */
export const formatRelativeTime = (isoDate) => {
  const seconds = (Date.now() - new Date(isoDate).getTime()) / 1000;
  const unit = UNITS.find((u) => seconds < u.limit) || UNITS[UNITS.length - 1];
  const value = Math.round(seconds / unit.divisor);
  return value <= 0 ? "just now" : rtf.format(-value, unit.unit);
};
