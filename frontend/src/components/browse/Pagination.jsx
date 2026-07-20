import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Numbered pagination, not infinite scroll — chosen because the
 * backend already returns an exact `total` count (see
 * productController.js getAllProducts), which is exactly what
 * numbered pages need and infinite scroll doesn't use. Infinite
 * scroll would also fight the "preserve in URL / survive refresh"
 * requirement: with `page` as a single URL param, refreshing mid-list
 * trivially returns to the same page; with infinite scroll you'd have
 * to re-fetch and re-append every prior page to restore scroll
 * position, for no real benefit here.
 */
const Pagination = ({ page, limit, total, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (pageNumber) => pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - page) <= 1
  );

  const rangeStart = (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
      <p className="text-caption text-text-muted">
        Showing <span className="font-medium text-text-secondary">{rangeStart}–{rangeEnd}</span> of{" "}
        <span className="font-medium text-text-secondary">{total}</span> results
      </p>

      <ul className="flex items-center gap-1">
        <li>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-40 transition-colors duration-base ease-standard"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </li>

        {pageNumbers.map((pageNumber, index) => {
          const previous = pageNumbers[index - 1];
          const showEllipsis = previous && pageNumber - previous > 1;

          return (
            <li key={pageNumber} className="flex items-center gap-1">
              {showEllipsis && <span className="px-1 text-text-muted">…</span>}
              <button
                type="button"
                onClick={() => onPageChange(pageNumber)}
                aria-current={pageNumber === page ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-body-sm font-medium transition-all duration-base ease-standard",
                  pageNumber === page
                    ? "bg-primary text-text-inverse shadow-xs"
                    : "text-text-secondary hover:bg-surface-hover"
                )}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}

        <li>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-40 transition-colors duration-base ease-standard"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
