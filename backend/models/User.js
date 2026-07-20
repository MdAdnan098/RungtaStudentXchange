import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },

    email: {
      type: String,
      required: [
        function () {
          return this.role !== "admin";
        },
        "Email is required",
      ],
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },

    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    phone: {
      type: String,
      required: [
        function () {
          return this.role !== "admin";
        },
        "Mobile number is required",
      ],
      unique: true,
      sparse: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please provide a valid 10-digit mobile number"],
    },

    avatar: {
      type: String,
      default: null,
    },

    avatarPublicId: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [200, "Bio cannot exceed 200 characters"],
      default: null,
    },

    location: {
      type: String,
      trim: true,
      default: null,
    },

    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Role must be either user or admin",
      },
      default: "user",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isStudentVerified: {
      type: Boolean,
      default: false,
    },

    studentEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },

    studentVerifiedAt: {
      type: Date,
      default: null,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    bannedReason: {
      type: String,
      trim: true,
      default: null,
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────

userSchema.index({ role: 1 });
userSchema.index({ isStudentVerified: 1 });
userSchema.index({ isBanned: 1 });
userSchema.index(
  { studentEmail: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { studentEmail: { $type: "string" } },
  }
);

// ─── Pre-save Middleware: Hash Password ──────────────────────────────────────

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Method: Compare Password ──────────────────────────────────────

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Hide Sensitive Fields from JSON Responses ───────────────────────────────

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.avatarPublicId;
  delete user.__v;
  return user;
};

// ─── Export ──────────────────────────────────────────────────────────────────

const User = mongoose.model("User", userSchema);

export default User;
