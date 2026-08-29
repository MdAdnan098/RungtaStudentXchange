/**
 * JSON-payload version of the old buildProductFormData — same field
 * logic, but plain object instead of FormData (no files pass through
 * here anymore; `uploadedImages` is already the array of
 * { url, fileId } returned by uploadToImageKit.js).
 */
export const buildProductPayload = (values, uploadedImages, mode) => {
  const payload = {
    title: values.title.trim(),
    description: values.description.trim(),
    price: Number(values.price),
    category: values.category,
    condition: values.condition,
    whatsappNumber: values.whatsappNumber.trim(),
  };

  if (values.alternateNumber?.trim()) {
    payload.alternateNumber = values.alternateNumber.trim();
  }

  // Same reasoning as the old buildProductFormData: on update this
  // must always be sent explicitly, or an unchecked "Negotiable" box
  // could never be saved back to false.
  if (mode === "update") {
    payload.negotiable = Boolean(values.negotiable);
  } else if (values.negotiable) {
    payload.negotiable = true;
  }

  if (values.location?.trim()) {
    payload.location = values.location.trim();
  }

  const tags = (values.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (tags.length > 0) {
    payload.tags = tags;
  }

  if (uploadedImages && uploadedImages.length > 0) {
    payload.images = uploadedImages.map(({ url, fileId }) => ({ url, fileId }));
  }

  return payload;
};