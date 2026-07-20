// Maps each backend condition value (constants/index.js → CONDITIONS)
// to a badge variant. Shared by ProductCard (Browse) and
// ProductInfoPanel (Product Details) so the same condition always
// reads as the same color everywhere it appears.
export const CONDITION_BADGE_CLASS = {
  new: "badge-success",
  "like new": "badge-accent",
  good: "badge-primary",
  fair: "badge-warning",
};
