// Maps each real product status (see AvailabilityField.jsx — the only
// values the backend accepts are "active", "sold", "removed") to a
// badge variant + display label. Only used where an owner needs to
// see status at a glance (My Listings); Browse/Wishlist never show
// removed/sold items in the first place, so this stays opt-in on
// ProductCard rather than always-on.
export const STATUS_BADGE_CLASS = {
  active: "badge-success",
  sold: "badge-neutral",
  removed: "badge-danger",
};

export const STATUS_LABEL = {
  active: "Available",
  sold: "Sold",
  removed: "Removed",
};
