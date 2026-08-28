import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import Modal, { ModalHeader } from "@/components/common/Modal";
import { cn } from "@/utils/cn";

const LIGHTBOX_TITLE_ID = "image-gallery-lightbox-title";

const SWIPE_THRESHOLD_PX = 40;

/**
 * "No images" is one of this task's required empty states, reusing
 * the existing EmptyState component rather than a bespoke one — the
 * backend requires at least one image at creation time, but this
 * still guards defensively (a product record could end up with an
 * empty array some other way, and the UI shouldn't break on it).
 *
 * Separately, `failedIds` tracks individual images whose URL failed
 * to load (broken/expired Cloudinary link) — a fallback shown in
 * place of the browser's default broken-image icon, so a single dead
 * URL can never break the gallery's layout or leave a blank square.
 */
const ImageGallery = ({ images, title }) => {
  const [index, setIndex] = useState(0);
  const [failedIds, setFailedIds] = useState(() => new Set());
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartXRef = useRef(null);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full">
        <EmptyState
          icon={ImageOff}
          title="No images"
          description="The seller hasn't added photos for this listing yet."
          className="h-full"
        />
      </div>
    );
  }

  const markFailed = (key) => setFailedIds((current) => new Set(current).add(key));

  const goTo = (nextIndex) => setIndex((nextIndex + images.length) % images.length);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") goTo(index + 1);
    if (event.key === "ArrowLeft") goTo(index - 1);
  };

  const handleTouchStart = (event) => {
    touchStartXRef.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartXRef.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      goTo(delta < 0 ? index + 1 : index - 1);
    }
    touchStartXRef.current = null;
  };

  const activeKey = images[index].publicId || index;
  const activeFailed = failedIds.has(activeKey);

  return (
    <div>
      <div
        role="group"
        aria-label={`Image ${index + 1} of ${images.length} for ${title}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-background-subtle shadow-card dark:shadow-card-dark"
      >
        {activeFailed ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-text-muted">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
            <span className="text-body-sm">Image unavailable</span>
          </div>
        ) : (
          // Main image is eager, not lazy — it's the primary
          // above-the-fold content of this page. Only the smaller
          // thumbnails below are lazy-loaded.
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="h-full w-full cursor-zoom-in"
            aria-label="View full-size image"
          >
            <img
              src={images[index].url}
              alt={`${title} — photo ${index + 1} of ${images.length}`}
              loading="eager"
              onError={() => markFailed(activeKey)}
              className="h-full w-full object-contain transition-transform duration-slow ease-standard hover:scale-110"
            />
          </button>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-text-secondary shadow-sm backdrop-blur-sm transition-all duration-base ease-standard hover:scale-105 hover:text-text active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-text-secondary shadow-sm backdrop-blur-sm transition-all duration-base ease-standard hover:scale-105 hover:text-text active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>

            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-surface/90 px-2.5 py-1 text-caption text-text-secondary shadow-sm backdrop-blur-sm">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div role="tablist" aria-label="Product images" className="scrollbar-hide mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {images.map((image, imageIndex) => {
            const key = image.publicId || imageIndex;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={imageIndex === index}
                aria-label={`View photo ${imageIndex + 1}`}
                onClick={() => setIndex(imageIndex)}
                className={cn(
                  "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-background-subtle transition-all duration-base ease-standard",
                  imageIndex === index
                    ? "border-primary shadow-xs"
                    : "border-transparent opacity-80 hover:opacity-100 hover:border-border-strong"
                )}
              >
                {failedIds.has(key) ? (
                  <ImageOff className="h-4 w-4 text-text-muted" aria-hidden="true" />
                ) : (
                  <img
                    src={image.url}
                    alt=""
                    loading="lazy"
                    onError={() => markFailed(key)}
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        titleId={LIGHTBOX_TITLE_ID}
        maxWidthClass="max-w-3xl"
      >
        <ModalHeader titleId={LIGHTBOX_TITLE_ID} title={title} onClose={() => setIsLightboxOpen(false)} />
        {!activeFailed && (
          <img
            src={images[index].url}
            alt={`${title} — photo ${index + 1} of ${images.length}`}
            className="mx-auto max-h-[75vh] w-full rounded-xl bg-background-subtle object-contain"
          />
        )}
      </Modal>
    </div>
  );
};

export default ImageGallery;
