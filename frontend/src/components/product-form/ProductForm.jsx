import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Camera, ClipboardList, IndianRupee, MapPin } from "lucide-react";
import { CATEGORIES, CONDITIONS } from "@/constants";
import {
  titleRule,
  descriptionRule,
  priceRule,
  categoryRule,
  conditionRule,
  whatsappNumberRule,
  alternateNumberRule,
  MIN_IMAGES,
} from "@/utils/productValidationRules";
import { buildProductPayload } from "@/utils/buildProductPayload";
import { uploadToImageKit } from "@/utils/uploadToImageKit";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { createProduct, updateProduct } from "@/api/products";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import TextField from "@/components/auth/TextField";
import FormError from "@/components/auth/FormError";
import ImageUploadField from "@/components/product-form/ImageUploadField";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { cn } from "@/utils/cn";

let nextId = 0;
const makeId = () => `img-${Date.now()}-${nextId++}`;

// Existing product images arrive as { url, publicId } — normalize to
// the same { id, url, file } shape ImageUploadField works with,
// `file: null` marking them as "existing, not yet changed." `fileId`
// is carried through unchanged so an untouched image can be sent back
// to the backend as-is (see onSubmit) without re-uploading it.
const toImageState = (images = []) =>
  images.map((image) => ({ id: makeId(), url: image.url, file: null, fileId: image.publicId }));

/**
 * A titled card wrapper used to group related fields — icon badge +
 * overline label + card-padded body. Mirrors the same pattern used on
 * Create Listing (and originally on Settings), so Edit Listing reads
 * as the same design language / same flow rather than a different
 * layout for the same form.
 */
const FormSection = ({ icon: Icon, title, children }) => (
  <div>
    <div className="mb-2.5 flex items-center gap-2 px-1">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary-subtle-text">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <h2 className="text-overline uppercase tracking-wide text-text-muted">{title}</h2>
    </div>
    <div className="card-padded space-y-5">{children}</div>
  </div>
);

/**
 * One component for both routes: /sell passes `mode="create"` and no
 * `product`; /products/:id/edit passes `mode="edit"` with the fully-
 * loaded product (the parent page owns fetching/loading/ownership
 * checks — this component assumes it's safe to render once mounted).
 *
 * In practice only Edit Listing renders this component today (Create
 * Listing has its own CreateListingForm) — the `mode="create"` branch
 * below is left intact rather than stripped, since removing a working,
 * still-reachable code path isn't a presentation change.
 */
const ProductForm = ({ mode, product, onSuccess }) => {
  const navigate = useNavigate();
  const [images, setImages] = useState(() => toImageState(product?.images));
  const imagesRef = useRef(images);
  imagesRef.current = images;

  // Newly-added images use URL.createObjectURL — those blob URLs stay
  // alive in memory until explicitly revoked, even after the
  // component unmounts (a full page reload isn't guaranteed for SPA
  // navigation). Revoking existing/remote URLs would be wrong (they're
  // real Cloudinary URLs, not blobs), so only ones with `.file` set —
  // i.e. actually created by this component — are cleaned up.
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        if (image.file) URL.revokeObjectURL(image.url);
      });
    };
  }, []);
  const [imagesError, setImagesError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  const originalImageUrls = useMemo(() => (product?.images || []).map((image) => image.url), [product]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    defaultValues: {
      title: product?.title || "",
      description: product?.description || "",
      price: product?.price ?? "",
      category: product?.category || "",
      condition: product?.condition || "",
      negotiable: product?.negotiable || false,
      location: product?.location || "",
      tags: (product?.tags || []).join(", "),
      whatsappNumber: product?.whatsappNumber || "",
      alternateNumber: product?.alternateNumber || "",
    },
  });

  const titleValue = watch("title") || "";
  const descriptionValue = watch("description") || "";
  const tagsValue = watch("tags") || "";
  const tagChips = tagsValue
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  // Image changes don't register as react-hook-form "dirty" (images
  // are managed outside RHF, as real File objects) — combined here so
  // the unsaved-changes warning and Cancel-button confirmation both
  // see the true dirty state.
  const imagesChanged =
    images.length !== originalImageUrls.length || images.some((image) => image.file !== null);
  const isFormDirty = isDirty || imagesChanged;

  useUnsavedChangesWarning(isFormDirty && !isSubmitting);

  const handleCancel = () => {
    if (isFormDirty && !window.confirm("Discard your unsaved changes?")) return;
    navigate(-1);
  };

  const onSubmit = async (values) => {
    if (images.length < MIN_IMAGES) {
      setImagesError(`At least ${MIN_IMAGES} image is required`);
      return;
    }
    setImagesError(null);
    setSubmitError(null);

    try {
      let response;

      if (mode === "create") {
        setUploadProgress(0);
        const uploadedImages = await Promise.all(images.map((image) => uploadToImageKit(image.file, "products")));
        const payload = buildProductPayload(values, uploadedImages, "create");
        response = await createProduct(payload);
      } else if (imagesChanged) {
        // Only upload images that are actually new (`image.file` set)
        // — kept-as-is images already have their real ImageKit
        // { url, fileId } from when they were first uploaded, so
        // there's no re-upload cost for images the user didn't touch.
        setUploadProgress(0);
        const finalImages = await Promise.all(
          images.map((image) =>
            image.file ? uploadToImageKit(image.file, "products") : { url: image.url, fileId: image.fileId }
          )
        );
        const payload = buildProductPayload(values, finalImages, "update");
        response = await updateProduct(product._id, payload);
      } else {
        // Nothing about the images changed at all — send the update
        // with no `images` key so the backend leaves them untouched.
        const payload = buildProductPayload(values, null, "update");
        response = await updateProduct(product._id, payload);
      }

      toast.success(response.data.message || (mode === "create" ? "Listing created" : "Listing updated"));
      onSuccess(response.data.data.product);
    } catch (error) {
      setSubmitError(getErrorMessage(error, `Failed to ${mode === "create" ? "create" : "update"} listing`));
      setUploadProgress(null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="pb-28 sm:pb-0">
      <FormError message={submitError} />

      <div className="space-y-6">
        <FormSection icon={Camera} title="Photos">
          <ImageUploadField images={images} onChange={setImages} error={imagesError} />
        </FormSection>

        <FormSection icon={ClipboardList} title="Item details">
          <TextField
            id="product-title"
            label="Title"
            placeholder="e.g. Casio FX-991ES Scientific Calculator"
            registration={register("title", titleRule)}
            error={errors.title?.message}
            maxLength={100}
          />
          <div className="-mt-3 text-right text-caption text-text-muted">{titleValue.length}/100</div>

          <div>
            <label htmlFor="product-description" className="field-label">
              Description
            </label>
            <textarea
              id="product-description"
              rows={5}
              maxLength={1000}
              placeholder="Condition details, reason for selling, anything a buyer should know…"
              className={`textarea ${errors.description ? "input-error" : ""}`}
              {...register("description", descriptionRule)}
            />
            <div className="mt-1.5 flex items-center justify-between">
              {errors.description ? (
                <p className="field-error !mt-0">{errors.description.message}</p>
              ) : (
                <span className="text-caption text-text-muted">Minimum 10 characters</span>
              )}
              <span className="shrink-0 text-caption text-text-muted">{descriptionValue.length}/1000</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="product-category" className="field-label">
                Category
              </label>
              <select
                id="product-category"
                className={`select py-3 ${errors.category ? "input-error" : ""}`}
                {...register("category", categoryRule)}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="field-error">{errors.category.message}</p>}
            </div>

            <div>
              <label htmlFor="product-condition" className="field-label">
                Condition
              </label>
              <select
                id="product-condition"
                className={`select py-3 ${errors.condition ? "input-error" : ""}`}
                {...register("condition", conditionRule)}
              >
                <option value="" disabled>
                  Select condition
                </option>
                {CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
              {errors.condition && <p className="field-error">{errors.condition.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="product-tags" className="field-label">
              Tags (optional)
            </label>
            <input
              id="product-tags"
              className="input"
              placeholder="e.g. scientific, exam, calculator"
              {...register("tags")}
            />
            <p className="field-hint">Comma-separated — helps buyers find this listing when searching.</p>
            {tagChips.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tagChips.map((tag, index) => (
                  <span key={`${tag}-${index}`} className="badge-neutral">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </FormSection>

        <FormSection icon={IndianRupee} title="Price">
          <TextField
            id="product-price"
            label="Price (₹)"
            type="number"
            inputMode="decimal"
            min="0"
            placeholder="0"
            icon={<IndianRupee className="h-4 w-4" aria-hidden="true" />}
            registration={register("price", priceRule)}
            error={errors.price?.message}
          />

          <label
            htmlFor="product-negotiable"
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3.5 py-3",
              "text-body-sm text-text-secondary transition-colors duration-base ease-standard hover:bg-surface-hover"
            )}
          >
            <input
              id="product-negotiable"
              type="checkbox"
              className="h-4.5 w-4.5 rounded accent-primary"
              {...register("negotiable")}
            />
            Price is negotiable
          </label>
        </FormSection>

        <FormSection icon={MapPin} title="Location & contact">
          <TextField
            id="product-location"
            label="Location (optional)"
            placeholder="e.g. Boys Hostel Block C"
            registration={register("location")}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <TextField
                id="product-whatsapp"
                label="WhatsApp Number"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit number"
                registration={register("whatsappNumber", whatsappNumberRule)}
                error={errors.whatsappNumber?.message}
              />
              <p className="field-hint">Shown to buyers so they can contact you directly on WhatsApp.</p>
            </div>

            <div>
              <TextField
                id="product-alternate-number"
                label="Alternate Number (optional)"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit number"
                registration={register("alternateNumber", alternateNumberRule)}
                error={errors.alternateNumber?.message}
              />
              <p className="field-hint">In case a buyer can't reach you on WhatsApp, they can call this number.</p>
            </div>
          </div>
        </FormSection>
      </div>

      {uploadProgress !== null && isSubmitting && (
        <div className="mt-6 card-padded flex items-center justify-center gap-3 py-6">
          <LoadingSpinner size="md" className="text-primary" />
          <p className="field-hint !mb-0">Uploading your listing…</p>
        </div>
      )}

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-fixed flex gap-3 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-sm",
          "sm:static sm:z-auto sm:mt-6 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none"
        )}
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <button type="button" onClick={handleCancel} className="btn-ghost !rounded-xl btn-tactile" disabled={isSubmitting}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex-1 !rounded-xl shadow-sm btn-tactile hover:shadow-md"
          disabled={isSubmitting}
        >
          {isSubmitting && <LoadingSpinner size="sm" />}
          {isSubmitting
            ? mode === "create"
              ? "Publishing…"
              : "Saving…"
            : mode === "create"
            ? "Publish Listing"
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
