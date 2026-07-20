const FreshListingCardSkeleton = () => {
  return (
    <div className="card !rounded-2xl flex flex-col overflow-hidden" aria-hidden="true">
      <div className="aspect-[4/3] w-full animate-pulse bg-background-subtle" />
      <div className="flex flex-col gap-1.5 p-3 sm:p-3.5">
        <div className="h-3 w-16 animate-pulse rounded bg-background-subtle" />
        <div className="h-3.5 w-full animate-pulse rounded bg-background-subtle" />
        <div className="h-4 w-14 animate-pulse rounded bg-background-subtle" />
        <div className="mt-1.5 h-2.5 w-20 animate-pulse rounded bg-background-subtle" />
      </div>
    </div>
  );
};

export default FreshListingCardSkeleton;
