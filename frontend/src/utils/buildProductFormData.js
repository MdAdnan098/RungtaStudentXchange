/**
 * `mode: "create"` vs `"update"` matters for two fields specifically:
 *
 * - `negotiable`: createProduct does `negotiable || false` server-side,
 *   so omitting it is safe (defaults false). updateProduct does
 *   `if (negotiable !== undefined) product.negotiable = negotiable`,
 *   so on UPDATE this must always be sent explicitly (as the string
 *   "true"/"false" — Mongoose casts both to real Booleans) or an
 *   unchecked "Negotiable" box could never be saved back to false.
 *
 * - `tags`: only appended when non-empty. Sending an empty string
 *   would pass updateProduct's `tags !== undefined` check but then
 *   `"".split(",")` produces `[""]`, not `[]` — a real backend quirk
 *   (see backend-limitations note in the final summary) that means
 *   there's no clean way to fully clear tags via this endpoint. Left
 *   unsent rather than risk writing a stray empty tag.
 */
export const buildProductFormData = (values, imageFiles, mode) => {
  const formData = new FormData();

  formData.append("title", values.title.trim());
  formData.append("description", values.description.trim());
  formData.append("price", String(values.price));
  formData.append("category", values.category);
  formData.append("condition", values.condition);
  formData.append("whatsappNumber", values.whatsappNumber.trim());

  if (values.alternateNumber?.trim()) {
    formData.append("alternateNumber", values.alternateNumber.trim());
  }

  if (mode === "update") {
    formData.append("negotiable", values.negotiable ? "true" : "false");
  } else if (values.negotiable) {
    formData.append("negotiable", "true");
  }

  if (values.location?.trim()) {
    formData.append("location", values.location.trim());
  }

  const tags = (values.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (tags.length > 0) {
    formData.append("tags", tags.join(","));
  }

  imageFiles.forEach((file) => formData.append("images", file));

  return formData;
};
