// Mirrors backend/models/Product.js exactly (minlength/maxlength/min/
// enum) plus the upload constraints from
// backend/middleware/uploadMiddleware.js. Update here if the backend
// schema or upload limits ever change.

export const MAX_IMAGES = 6;
export const MIN_IMAGES = 1;
export const MAX_IMAGE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/avif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
];
export const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".gif",
  ".bmp",
  ".tiff",
  ".tif",
  ".avif",
  ".ico",
];

export const titleRule = {
  required: "Title is required",
  minLength: { value: 3, message: "Title must be at least 3 characters" },
  maxLength: { value: 100, message: "Title cannot exceed 100 characters" },
};

export const descriptionRule = {
  required: "Description is required",
  minLength: { value: 10, message: "Description must be at least 10 characters" },
  maxLength: { value: 1000, message: "Description cannot exceed 1000 characters" },
};

export const priceRule = {
  required: "Price is required",
  min: { value: 0, message: "Price cannot be negative" },
  validate: (value) => !Number.isNaN(Number(value)) || "Enter a valid price",
};

export const categoryRule = {
  required: "Category is required",
};

export const conditionRule = {
  required: "Condition is required",
};

export const whatsappNumberRule = {
  required: "WhatsApp number is required so buyers can contact you",
  pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit WhatsApp number" },
};

export const alternateNumberRule = {
  validate: (value) => !value || /^[0-9]{10}$/.test(value) || "Enter a valid 10-digit number",
};

export const validateImageFile = (file) => {
  const extension = file.name?.slice(file.name.lastIndexOf(".")).toLowerCase();
  const hasValidType = ALLOWED_IMAGE_TYPES.includes(file.type);
  const hasValidExtension = extension && ALLOWED_IMAGE_EXTENSIONS.includes(extension);

  if (!hasValidType && !hasValidExtension) {
    return "Unsupported image format. Please upload a valid image file";
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `Each image must not exceed ${MAX_IMAGE_SIZE_MB}MB`;
  }
  return null;
};
