// Product prices are plain Numbers on the backend (Product.js — no
// currency field), so INR is an assumption, not a backend contract —
// reasonable for a Rungta College (India) marketplace, but flagged
// here in case that's wrong.
const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatPrice = (price) => formatter.format(price);
