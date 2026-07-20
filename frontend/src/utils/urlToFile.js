/**
 * BACKEND LIMITATION this exists to work around: updateProduct
 * (backend/controllers/productController.js) has no per-image
 * delete/add — if `req.files` is present at all, it deletes *every*
 * existing Cloudinary image and replaces the whole array with
 * whatever files were just uploaded. There's no way to say "keep
 * these 2, drop that 1, add this new one" in a single request.
 *
 * The only way to achieve "keep some existing images while changing
 * others" through the API as built is to re-submit the ones being
 * kept as real files alongside the new ones — which means fetching
 * their current URL and reconstructing a File from the bytes. That's
 * what this does. It costs a re-upload of unchanged image bytes
 * (download from Cloudinary, re-upload back to Cloudinary as a new
 * asset) — wasteful, but it's the only non-invented way to get this
 * behavior from the real endpoint.
 *
 * Only invoked when the user actually changes the image set in edit
 * mode (see ProductForm.jsx) — if they don't touch images at all, the
 * update request omits image files entirely and the backend correctly
 * leaves the existing images untouched, no re-upload needed.
 */
export const urlToFile = async (url, filename) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch existing image (${response.status})`);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
};
