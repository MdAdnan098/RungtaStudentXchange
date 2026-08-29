import { useEffect, useRef, useState } from "react";
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
import { createProduct } from "@/api/products";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import TextField from "@/components/auth/TextField";
import FormError from "@/components/auth/FormError";
import CreateListingImageUploader from "@/components/product-form/CreateListingImageUploader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { cn } from "@/utils/cn";

/**
 * A titled card wrapper used to group related fields — mirrors the
 * `SettingsSection` pattern (icon badge + overline label + card-padded
 * body) already used on the Settings page, so Create Listing reads as
 * the same design language rather than a one-off layout.
 */
const FormSection = ({ icon: Icon, title, description, children, sectionRef }) => (
  <div ref={sectionRef}>
    <div className="mb-2.5 flex items-center gap-2 px-1">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary-subtle-text">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <h2 className="text-overline uppercase tracking-wide text-text-muted">{title}</h2>
    </div>
    <div className="card-padded space-y-5">
      {description && <p className="-mt-1 text-caption text-text-muted">{description}</p>}
      {children}
    </div>
  </div>
);

/**
 * Create Listing's own form component — a deliberate fork of
 * ProductForm rather than a shared `mode` branch, so this page's
 * visual overhaul never touches Edit Listing (which keeps using
 * ProductForm + ImageUploadField exactly as before). Submission
 * logic (validation rules, FormData shape, API call) is copied
 * unchanged from ProductForm's `mode === "create"` path.
 */
// Matches Tailwind's `sm` breakpoint (see tailwind.config.js) — below
// this width is "mobile" for the scroll-to-top-on-submit behavior.
const MOBILE_BREAKPOINT = 640;

const CreateListingForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  // Newly-added images use URL.createObjectURL — those blob URLs stay
  // alive in memory until explicitly revoked, even after the
  // component unmounts (a full page reload isn't guaranteed for SPA
  // navigation).
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, []);

  const [imagesError, setImagesError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      price: "",
      category: "",
      condition: "",
      negotiable: false,
      location: "",
      tags: "",
      whatsappNumber: "",
      alternateNumber: "",
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
  const isFormDirty = isDirty || images.length > 0;

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

    // Uploads every image straight to ImageKit (in parallel) first,
    // then creates the listing with the resulting URLs — repeated for
    // both the initial try and the silent retry below, same as the
    // old FormData rebuild used to be.
    const attemptUpload = async () => {
      setUploadProgress(0);
      const uploadedImages = await Promise.all(images.map((image) => uploadToImageKit(image.file, "products")));
      const payload = buildProductPayload(values, uploadedImages, "create");
      return createProduct(payload);
    };

    try {
      const response = await attemptUpload();
      toast.success(response.data.message || "Listing created");
      onSuccess(response.data.data.product);
    } catch (error) {
      // `!error.response` is a true network-layer failure (no HTTP
      // response received at all) — most often the Render free-tier
      // backend waking up from a cold start (first request after a
      // period of inactivity can time out before the instance is
      // fully up). Retrying once, silently, gives that instance a
      // second chance to respond now that it's already awake — the
      // user only ever sees the error if this retry ALSO fails,
      // instead of having to manually remove/re-select the image to
      // trigger a second attempt themselves.
      if (!error.response) {
        try {
          const retryResponse = await attemptUpload();
          toast.success(retryResponse.data.message || "Listing created");
          onSuccess(retryResponse.data.data.product);
          return;
        } catch (retryError) {
          if (!retryError.response) {
            setSubmitError(
              "Sorry! Image upload complete nahi ho paya. Bas image ko remove karke wahi image dobara select kare. Form dobara bharne ki zarurat nahi hai."
            );
          } else {
            setSubmitError(getErrorMessage(retryError, "Failed to create listing"));
          }
        }
      } else {
        setSubmitError(getErrorMessage(error, "Failed to create listing"));
      }
      setUploadProgress(null);
    }
  };

  // Fires on tap/click of "Publish Listing", synchronously before the
  // native "submit" event (and therefore before react-hook-form's
  // validation and its own focus-driven scroll). This MUST be an
  // instant ("auto") jump rather than "smooth": a smooth scroll is an
  // animation spread across several frames, so if validation later
  // fails, RHF's default shouldFocusError behavior calls .focus() on
  // the invalid field, and the browser's native (instant) focus-scroll
  // interrupts our still-in-progress animation — the user never
  // actually sees the top-scroll. An instant jump completes
  // synchronously inside this click handler, before the submit event
  // even fires, so it always happens first — with the existing
  // validation-scroll (unchanged) simply layering on top of it right
  // after. Mobile only, per the brief; desktop is untouched since the
  // button and its error message are already in view there.
  //
  // window.scrollTo(0, 0) rather than a ref + scrollIntoView on the
  // first FormSection: CreateListing.jsx renders a page header
  // ("Create a listing" title + subtext) above this <form>. Anchoring
  // to the Photos section (the form's first child) left that header
  // off-screen — the user landed at the top of the form, not the top
  // of the page. window.scrollTo always reaches the true page top no
  // matter what the parent page renders above the form.
  const handlePublishClick = () => {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="pb-28 sm:pb-0">
      {/* Desktop: submit-time error stays at the very top of the form,
          exactly as before. Mobile has its own copy further down (see
          after the Location & contact section) so this one is hidden
          there to avoid showing the same message twice. */}
      <div className="hidden sm:block">
        <FormError message={submitError} />
      </div>

      <div className="space-y-6">
        <FormSection icon={Camera} title="Photos">
          <CreateListingImageUploader images={images} onChange={setImages} error={imagesError} />
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

        {/* Mobile-only copy of the submit-time error, placed in the
            gap right after the last form section (below the Alternate
            Number field) so it lands above the fixed bottom
            Cancel/Publish bar instead of at the top of the page.
            Desktop keeps the original top-of-form placement above. */}
        <div className="sm:hidden">
          <FormError message={submitError} />
        </div>
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
          onClick={handlePublishClick}
          className="btn-primary flex-1 !rounded-xl shadow-sm btn-tactile hover:shadow-md"
          disabled={isSubmitting}
        >
          {isSubmitting && <LoadingSpinner size="sm" />}
          {isSubmitting ? "Publishing…" : "Publish Listing"}
        </button>
      </div>
    </form>
  );
};

export default CreateListingForm;
