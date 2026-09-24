/**
 * Product.createdAt is an ISO timestamp (Mongoose `timestamps: true`).
 * Renders it as "just now" / "5 min ago" / "3 hr ago" / "2 days ago".
 *
 * Uses Math.floor (not round) so 11h40m reads "11 hr ago" rather than
 * jumping up to "12 hr ago", and clamps small negative differences
 * (device clock slightly behind the server) to "just now".
 */
export const formatRelativeTime = (isoDate, now = Date.now()) => {
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) return "";

  const seconds = Math.max(0, Math.floor((now - time) / 1000));

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  const weeks = Math.floor(days / 7);
  if (days < 30) return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  const months = Math.floor(days / 30);
  if (days < 365) return `${months} ${months === 1 ? "month" : "months"} ago`;
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
};