import { getUploadAuth } from "@/api/uploads";

const MAX_DIMENSION = 1600; // px — plenty for full-screen product photos, well beyond any card/thumbnail
const JPEG_QUALITY = 0.8;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // doubles each retry: 1s, 2s

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Best-effort browser-side compression via <canvas>. Formats canvas
// can't decode (notably HEIC on most non-Apple browsers) simply fail
// to draw — in that case we fall back to uploading the original file
// untouched rather than blocking the upload entirely.
const compressImage = (file) =>
  new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name, { type: "image/jpeg" }) : file),
        "image/jpeg",
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // e.g. HEIC on a browser that can't decode it — upload as-is
    };

    img.src = objectUrl;
  });

// College wifi/mobile data can be flaky enough that a single fetch to
// ImageKit occasionally fails with a plain network error (not a real
// rejection from ImageKit — those come back as a normal, non-ok
// response and aren't retried here). A couple of quick, silent
// retries clears this up without the user ever having to manually
// remove/re-select the image themselves.
const uploadWithRetry = async (formData) => {
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Image upload failed");
      }

      return result;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError;
};

/**
 * Compresses (best-effort) then uploads a single file straight to
 * ImageKit from the browser — our backend only ever issues the
 * signed auth params, never touches the bytes. Returns the same
 * `{ url, fileId }` shape the backend used to return when it did the
 * upload itself, so callers don't need to change.
 */
export const uploadToImageKit = async (file, folder = "rungtastudentxchange") => {
  const authResponse = await getUploadAuth();
  const { signature, token, expire, publicKey, urlEndpoint } = authResponse.data.data;

  const compressed = await compressImage(file);

  const formData = new FormData();
  formData.append("file", compressed);
  formData.append("fileName", file.name || "upload.jpg");
  formData.append("folder", `/${folder}`);
  formData.append("useUniqueFileName", "true");
  formData.append("publicKey", publicKey);
  formData.append("signature", signature);
  formData.append("token", token);
  formData.append("expire", expire);

  const result = await uploadWithRetry(formData);

  return { url: result.url, fileId: result.fileId, urlEndpoint };
};