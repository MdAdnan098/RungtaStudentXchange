import { useRef, useState } from "react";
import { ImagePlus, ImageOff, X, Star, UploadCloud, Camera } from "lucide-react";
import { MAX_IMAGES, validateImageFile } from "@/utils/productValidationRules";
import { cn } from "@/utils/cn";

let nextId = 0;
const makeId = () => `img-${Date.now()}-${nextId++}`;

/**
 * Create Listing's own fork of ImageUploadField — same upload/remove/
 * drag-drop behavior and the same `{ id, url, file }` shape ProductForm
 * expects, just with a more premium presentation (cover-photo badge,
 * bigger drop target, inline tips). Kept as a separate component
 * rather than editing ImageUploadField.jsx directly so Edit Listing
 * (which reuses that component via ProductForm) is untouched.
 */
const CreateListingImageUploader = ({ images, onChange, error }) => {
  const inputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [fileErrors, setFileErrors] = useState([]);
  const [undecodableIds, setUndecodableIds] = useState(() => new Set());

  const remainingSlots = MAX_IMAGES - images.length;

  const addFiles = (fileList) => {
    const files = Array.from(fileList).slice(0, remainingSlots);
    const errors = [];
    const accepted = [];

    files.forEach((file) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        accepted.push({ id: makeId(), url: URL.createObjectURL(file), file });
      }
    });

    if (fileList.length > remainingSlots) {
      errors.push(
        `Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} can be added (max ${MAX_IMAGES}).`
      );
    }

    setFileErrors(errors);
    if (accepted.length > 0) onChange([...images, ...accepted]);
  };

  const handleRemove = (id) => {
    const target = images.find((image) => image.id === id);
    if (target?.file) URL.revokeObjectURL(target.url); // only revoke object URLs we created
    onChange(images.filter((image) => image.id !== id));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDraggingOver(false);
    if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="field-label !mb-0">Photos</span>
        <span className="text-caption text-text-muted">
          {images.length}/{MAX_IMAGES}
        </span>
      </div>
      <p className="mb-3 text-caption text-text-muted">
        The first photo is used as your cover image — buyers see it first in search results.
      </p>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-background-subtle shadow-xs transition-shadow duration-base ease-standard hover:shadow-sm"
          >
            {undecodableIds.has(image.id) ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-text-muted">
                <ImageOff className="h-5 w-5" aria-hidden="true" />
                <span className="text-overline">Preview unavailable</span>
              </div>
            ) : (
              <img
                src={image.url}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
                onError={() => setUndecodableIds((current) => new Set(current).add(image.id))}
              />
            )}

            {index === 0 && (
              <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-primary/95 px-2 py-0.5 text-[0.625rem] font-semibold text-text-inverse shadow-xs">
                <Star className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
                Cover
              </span>
            )}

            <button
              type="button"
              onClick={() => handleRemove(image.id)}
              className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-text-secondary shadow-sm backdrop-blur-sm transition-colors duration-base ease-standard hover:bg-danger hover:text-text-inverse"
              aria-label="Remove this photo"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}

        {remainingSlots > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-text-muted transition-all duration-base ease-standard",
              isDraggingOver
                ? "scale-[0.98] border-primary bg-primary-subtle text-primary"
                : "border-border-strong hover:border-primary/60 hover:bg-primary-subtle/40 hover:text-primary"
            )}
            aria-label="Add photos"
          >
            {isDraggingOver ? (
              <UploadCloud className="h-5 w-5" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            )}
            <span className="text-caption">{images.length === 0 ? "Add photos" : "Add more"}</span>
          </button>
        )}

        {remainingSlots > 0 && (
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border-strong text-text-muted transition-all duration-base ease-standard hover:border-primary/60 hover:bg-primary-subtle/40 hover:text-primary"
            aria-label="Take a photo"
          >
            <Camera className="h-5 w-5" aria-hidden="true" />
            <span className="text-caption">Camera</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        onChange={(event) => {
          if (event.target.files?.length) addFiles(event.target.files);
          event.target.value = ""; // allow re-selecting the same file after removing it
        }}
        className="sr-only"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(event) => {
          if (event.target.files?.length) addFiles(event.target.files);
          event.target.value = "";
        }}
        className="sr-only"
      />

      <p className="field-hint">
        Any image format (JPG, PNG, WEBP, HEIC, etc.) · up to 5MB each · 1–{MAX_IMAGES} photos
      </p>
      {error && <p className="field-error">{error}</p>}
      {fileErrors.map((message) => (
        <p key={message} className="field-error">
          {message}
        </p>
      ))}
    </div>
  );
};

export default CreateListingImageUploader;
