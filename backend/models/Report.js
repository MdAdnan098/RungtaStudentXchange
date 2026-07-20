import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter reference is required"],
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },

    reason: {
      type: String,
      required: [true, "Reason is required"],
      enum: {
        values: ["spam", "misleading", "prohibited", "duplicate", "other"],
        message:
          "Reason must be one of: spam, misleading, prohibited, duplicate, other",
      },
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "reviewed", "resolved", "dismissed"],
        message:
          "Status must be one of: pending, reviewed, resolved, dismissed",
      },
      default: "pending",
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

reportSchema.index({ status: 1 });
reportSchema.index({ product: 1 });
reportSchema.index({ reporter: 1 });
reportSchema.index({ createdAt: -1 });

// ─── Export ───────────────────────────────────────────────────────────────────

const Report = mongoose.model("Report", reportSchema);

export default Report;
