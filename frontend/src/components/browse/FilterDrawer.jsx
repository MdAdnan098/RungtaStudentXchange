import SlideOverPanel from "@/components/common/SlideOverPanel";
import FilterFields from "@/components/browse/FilterFields";

const FilterDrawer = ({ isOpen, onClose, resultCount, ...filterProps }) => {
  return (
    <SlideOverPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      ariaLabel="Filter products"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="btn-primary w-full !rounded-xl shadow-sm btn-tactile hover:shadow-md"
        >
          Show {resultCount} {resultCount === 1 ? "result" : "results"}
        </button>
      }
    >
      <div className="px-2.5 pb-2">
        <FilterFields {...filterProps} />
      </div>
    </SlideOverPanel>
  );
};

export default FilterDrawer;
