const Bar = ({ className }) => <div className={`animate-pulse rounded bg-background-subtle ${className}`} />;

const ProductDetailsSkeleton = () => {
  return (
    <div aria-hidden="true" aria-busy="true">
      <span className="sr-only">Loading product…</span>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-background-subtle" />
          <div className="mt-3 flex gap-2.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 w-16 animate-pulse rounded-xl bg-background-subtle" />
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Bar className="h-5 w-20" />
            <Bar className="h-5 w-20" />
          </div>
          <Bar className="h-8 w-3/4" />
          <Bar className="h-9 w-32" />
          <Bar className="h-4 w-40" />

          <div className="card-padded !rounded-2xl mt-2 flex items-center gap-3.5">
            <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-background-subtle" />
            <div className="flex-1 space-y-2">
              <Bar className="h-4 w-32" />
              <Bar className="h-3 w-24" />
            </div>
          </div>

          <div className="mt-2 flex gap-2.5">
            <Bar className="h-11 flex-1 !rounded-xl" />
            <Bar className="h-11 w-11 !rounded-xl" />
            <Bar className="h-11 w-11 !rounded-xl" />
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-2 border-t border-border pt-8">
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-2/3" />
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
