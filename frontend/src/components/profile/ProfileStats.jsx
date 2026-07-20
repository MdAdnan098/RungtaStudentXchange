import { useMemo } from "react";

/**
 * The backend has no statistics endpoint or precomputed counts
 * anywhere on the User model — these three numbers are computed here
 * from the same `listings` array MyListings.jsx already has (via
 * useMyListings), grouping by Product.status. Real data, just
 * aggregated client-side rather than fabricated.
 */
const ProfileStats = ({ listings }) => {
  const stats = useMemo(() => {
    const active = listings.filter((item) => item.status === "active").length;
    const sold = listings.filter((item) => item.status === "sold").length;
    return { total: listings.length, active, sold };
  }, [listings]);

  const items = [
    { label: "Listings", value: stats.total },
    { label: "Active", value: stats.active },
    { label: "Sold", value: stats.sold },
  ];

  return (
    <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-surface">
      {items.map((item) => (
        <div key={item.label} className="px-4 py-3 text-center">
          <p className="font-display text-h4 text-text">{item.value}</p>
          <p className="text-caption text-text-muted">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;
