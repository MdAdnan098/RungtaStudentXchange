import FilterFields from "@/components/browse/FilterFields";

const FilterSidebar = (props) => {
  return (
    <aside aria-label="Filters" className="hidden lg:block w-64 shrink-0">
      <div className="card-padded sticky top-20">
        <FilterFields {...props} />
      </div>
    </aside>
  );
};

export default FilterSidebar;
