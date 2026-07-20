import mongoose from "mongoose";

// One document per landing-page visit. The consent dialog + browser
// permission popup are only ever shown once per browser/device (see
// frontend/src/hooks/useVisitorTracking.js) — every visit after that
// still creates a new VisitorLog document, silently, reusing whichever
// permission decision was made the first time. `permissionStatus`
// records what's actually known for THIS visit, so granted vs denied
// vs dismissed vs unavailable can always be told apart later, even
// though only "granted" carries coordinates.
const visitorLogSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      default: null,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      default: null,
      min: -180,
      max: 180,
    },

    // "granted"     — permission is (or was) granted and coordinates were read successfully
    // "denied"      — browser permission popup was shown and rejected
    // "dismissed"   — visitor clicked "Not Now" on our own consent dialog,
    //                 browser popup was never shown
    // "unavailable" — permission is granted, but a coordinate couldn't be
    //                 read this visit (e.g. device location/GPS is off)
    permissionStatus: {
      type: String,
      enum: {
        values: ["granted", "denied", "dismissed", "unavailable"],
        message: "Permission status must be one of: granted, denied, dismissed, unavailable",
      },
      required: [true, "Permission status is required"],
    },

    country: {
      type: String,
      trim: true,
      default: null,
    },

    state: {
      type: String,
      trim: true,
      default: null,
    },

    // Admin level between state and city (e.g. Indian revenue
    // districts) — powers the mid-zoom labels on the admin Visitor Map.
    district: {
      type: String,
      trim: true,
      default: null,
    },

    // Neighbourhood-level — powers the closest-zoom labels on the
    // admin Visitor Map.
    area: {
      type: String,
      trim: true,
      default: null,
    },

    city: {
      type: String,
      trim: true,
      default: null,
    },

    browser: {
      type: String,
      trim: true,
      default: "Unknown",
    },

    operatingSystem: {
      type: String,
      trim: true,
      default: "Unknown",
    },

    deviceType: {
      type: String,
      enum: {
        values: ["Mobile", "Desktop", "Tablet"],
        message: "Device type must be one of: Mobile, Desktop, Tablet",
      },
      default: "Desktop",
    },

    ipAddress: {
      type: String,
      trim: true,
      default: null,
    },

    // Guest vs logged-in, mirroring the same pattern as
    // Report.reporter / Product.seller — a populated ref when logged
    // in, null for guests.
    isGuest: {
      type: Boolean,
      default: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

visitorLogSchema.index({ createdAt: -1 });
visitorLogSchema.index({ user: 1 });
visitorLogSchema.index({ permissionStatus: 1 });
visitorLogSchema.index({ isGuest: 1 });
visitorLogSchema.index({ country: 1, state: 1, city: 1 });
visitorLogSchema.index({ ipAddress: 1 });

// ─── Export ───────────────────────────────────────────────────────────────────

const VisitorLog = mongoose.model("VisitorLog", visitorLogSchema);

export default VisitorLog;
