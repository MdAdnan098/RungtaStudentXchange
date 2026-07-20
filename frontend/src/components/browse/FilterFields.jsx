import { useEffect, useState } from "react";
import { CATEGORIES, CONDITIONS } from "@/constants";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/utils/cn";

const FilterGroup = ({ title, children }) => (
  <div className="py-5 first:pt-0">
    <h3 className="mb-3 text-caption font-semibold uppercase tracking-wide text-text-muted">{title}</h3>
    {children}
  </div>
);

const RadioOption = ({ name, label, checked, onChange }) => (
  <label className="-mx-2 flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-body-sm text-text-secondary transition-colors duration-base ease-standard hover:bg-surface-hover">
    <input
      type="radio"
      name={name}
      checked={checked}
      onChange={onChange}
      className="h-4.5 w-4.5 shrink-0 accent-primary focus-visible:ring-2 focus-visible:ring-ring"
    />
    <span className={cn(checked && "font-medium text-text")}>{label}</span>
  </label>
);

/**
 * Price min/max debounce locally before touching the URL — otherwise
 * every keystroke in a number field would fire a request and rewrite
 * browser history. `filters.minPrice`/`maxPrice` (the URL's current
 * value) is the source of truth; local state just buffers typing.
 */
const PriceRangeFields = ({ minPrice, maxPrice, onChange }) => {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const debouncedMin = useDebouncedValue(localMin, 500);
  const debouncedMax = useDebouncedValue(localMax, 500);

  // Keep local state in sync if the URL changes from elsewhere (e.g.
  // a chip removal or "Clear filters").
  useEffect(() => setLocalMin(minPrice), [minPrice]);
  useEffect(() => setLocalMax(maxPrice), [maxPrice]);

  useEffect(() => {
    if (debouncedMin !== minPrice) onChange("minPrice", debouncedMin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMin]);

  useEffect(() => {
    if (debouncedMax !== maxPrice) onChange("maxPrice", debouncedMax);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMax]);

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1">
        <label htmlFor="filter-min-price" className="sr-only">
          Minimum price
        </label>
        <input
          id="filter-min-price"
          type="number"
          inputMode="numeric"
          min="0"
          placeholder="Min"
          value={localMin}
          onChange={(event) => setLocalMin(event.target.value)}
          className="input h-11"
        />
      </div>
      <span className="text-text-muted" aria-hidden="true">
        –
      </span>
      <div className="flex-1">
        <label htmlFor="filter-max-price" className="sr-only">
          Maximum price
        </label>
        <input
          id="filter-max-price"
          type="number"
          inputMode="numeric"
          min="0"
          placeholder="Max"
          value={localMax}
          onChange={(event) => setLocalMax(event.target.value)}
          className="input h-11"
        />
      </div>
    </div>
  );
};

const FilterFields = ({ filters, setFilter, clearFilters, activeFilterCount }) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-h6">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="-mr-2 rounded-lg px-2 py-1 text-caption font-medium text-primary transition-colors duration-base ease-standard hover:bg-primary-subtle hover:text-primary-hover"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="divide-y divide-border">
        <FilterGroup title="Category">
          <RadioOption
            name="filter-category"
            label="All categories"
            checked={!filters.category}
            onChange={() => setFilter("category", "")}
          />
          {CATEGORIES.map((category) => (
            <RadioOption
              key={category}
              name="filter-category"
              label={category}
              checked={filters.category === category}
              onChange={() => setFilter("category", category)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Condition">
          <RadioOption
            name="filter-condition"
            label="Any condition"
            checked={!filters.condition}
            onChange={() => setFilter("condition", "")}
          />
          {CONDITIONS.map((condition) => (
            <RadioOption
              key={condition}
              name="filter-condition"
              label={condition}
              checked={filters.condition === condition}
              onChange={() => setFilter("condition", condition)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Price range">
          <PriceRangeFields minPrice={filters.minPrice} maxPrice={filters.maxPrice} onChange={setFilter} />
        </FilterGroup>

        <FilterGroup title="Seller">
          <label className="-mx-2 flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-body-sm text-text-secondary transition-colors duration-base ease-standard hover:bg-surface-hover">
            <input
              type="checkbox"
              checked={filters.studentOnly}
              onChange={(event) => setFilter("studentOnly", event.target.checked)}
              className="h-4.5 w-4.5 shrink-0 rounded accent-primary focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className={cn(filters.studentOnly && "font-medium text-text")}>Verified students only</span>
          </label>
        </FilterGroup>
      </div>
    </div>
  );
};

export default FilterFields;
