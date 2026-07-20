import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const SearchBar = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebouncedValue(localValue, 400);

  // Stay in sync if the search term changes from elsewhere (a chip
  // removal, browser back/forward).
  useEffect(() => setLocalValue(value), [value]);

  useEffect(() => {
    if (debouncedValue !== value) onChange(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <div className="group relative">
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted transition-colors duration-base ease-standard group-focus-within:text-primary"
        aria-hidden="true"
      />
      <input
        id="product-search"
        type="search"
        placeholder="Search for books, electronics, and more…"
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
        className="input h-12 !rounded-xl !pl-11 !pr-11 text-body shadow-xs transition-shadow duration-base ease-standard hover:shadow-sm"
      />
      {localValue && (
        <button
          type="button"
          onClick={() => setLocalValue("")}
          className="absolute right-2.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition-colors duration-base ease-standard hover:bg-surface-hover hover:text-text"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
