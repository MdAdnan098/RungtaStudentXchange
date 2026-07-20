import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

// Every common image type a phone or camera might produce — not just
// JPG/PNG/WEBP. HEIC/HEIF (default iPhone photo format) is the main
// one users hit in practice; the rest are included so "any image
// extension" genuinely works rather than allowlisting a handful.
const allowedMimeTypes = [
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

const allowedExtensions = [
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

// Some mobile browsers/OSes (notably iOS Safari with HEIC photos, or
// some Android WebViews) don't set a proper image/* mimetype and send
// "application/octet-stream" instead — in that case fall back to
// trusting the file extension rather than rejecting a genuine photo.
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname || "").toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported image format. Please upload a valid image file"), false);
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

export const uploadSingleImage = (req, res, next) => {
  const handler = upload.single("image");

  handler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Image size cannot exceed 5MB",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "File upload error",
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload error",
      });
    }
    next();
  });
};

export const uploadMultipleImages = (req, res, next) => {
  const handler = upload.array("images", 6);

  handler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Each image must not exceed 5MB",
        });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          success: false,
          message: "You can upload a maximum of 6 images",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "File upload error",
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload error",
      });
    }
    next();
  });
};
