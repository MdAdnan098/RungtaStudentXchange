const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most popular" },
];

const SortDropdown = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="product-sort" className="sr-only">
        Sort products
      </label>
      <select
        id="product-sort"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="select h-12 w-full !rounded-xl shadow-xs transition-shadow duration-base ease-standard hover:shadow-sm sm:w-56"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortDropdown;
