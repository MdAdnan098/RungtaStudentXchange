import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    negotiable: {
      type: Boolean,
      default: false,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: {
        values: ["new", "like new", "good", "fair"],
        message: "Condition must be one of: new, like new, good, fair",
      },
    },

    images: {
      type: [imageSchema],
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 6,
        message: "A listing must have between 1 and 6 images",
      },
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller reference is required"],
    },

    status: {
      type: String,
      enum: {
        values: ["active", "sold", "removed"],
        message: "Status must be one of: active, sold, removed",
      },
      default: "active",
    },

    location: {
      type: String,
      trim: true,
      default: null,
    },

    whatsappNumber: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "WhatsApp number must be a valid 10-digit number"],
    },

    alternateNumber: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Alternate number must be a valid 10-digit number"],
      default: null,
    },

    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ condition: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// ─── Export ───────────────────────────────────────────────────────────────────

const Product = mongoose.model("Product", productSchema);

export default Product;
