import { X } from "lucide-react";

/**
 * Sort isn't represented as a chip — there's always a sort order
 * (default "newest"), so "removing" it doesn't map to a clear action
 * the way removing a restrictive filter does. Matches how most
 * marketplace UIs (OLX, Facebook Marketplace) treat sort as separate
 * from the filter chip row.
 */
const ActiveFilterChips = ({ filters, setFilter }) => {
  const chips = [];

  if (filters.search) {
    chips.push({ key: "search", label: `"${filters.search}"`, onRemove: () => setFilter("search", "") });
  }
  if (filters.category) {
    chips.push({ key: "category", label: filters.category, onRemove: () => setFilter("category", "") });
  }
  if (filters.condition) {
    chips.push({ key: "condition", label: filters.condition, onRemove: () => setFilter("condition", "") });
  }
  if (filters.minPrice || filters.maxPrice) {
    const label =
      filters.minPrice && filters.maxPrice
        ? `₹${filters.minPrice} – ₹${filters.maxPrice}`
        : filters.minPrice
        ? `₹${filters.minPrice}+`
        : `Under ₹${filters.maxPrice}`;
    chips.push({
      key: "price",
      label,
      onRemove: () => {
        setFilter("minPrice", "", { resetPage: false });
        setFilter("maxPrice", "");
      },
    });
  }
  if (filters.studentOnly) {
    chips.push({
      key: "studentOnly",
      label: "Verified students only",
      onRemove: () => setFilter("studentOnly", false),
    });
  }

  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={chip.onRemove}
            className="badge-primary group !gap-2 !py-1.5 !pl-3 !pr-1.5 !text-caption normal-case shadow-xs transition-shadow duration-base ease-standard hover:shadow-sm"
          >
            <span className="max-w-[9rem] truncate sm:max-w-[14rem]">{chip.label}</span>
            <span className="inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full transition-colors duration-base ease-standard group-hover:bg-primary/20">
              <X className="h-3 w-3" aria-hidden="true" />
            </span>
            <span className="sr-only">Remove filter</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ActiveFilterChips;
