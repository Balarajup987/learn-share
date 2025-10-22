import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // unified roles: "student" | "teacher" | "both" | "admin"
    role: {
      type: String,
      enum: ["student", "teacher", "both", "admin"],
      default: "student",
      index: true,
    },

    // public profile fields used previously by Teacher
    categories: [String],
    experience: String,
    bio: String,
    mode: String,
    github: String,
    linkedin: String,
    website: String,
    idFile: String,

    // connection system (user-to-user)
    requestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // OTP for password reset
    otp: String,
    otpExpires: Date,

    // User status and restrictions
    status: {
      type: String,
      enum: ["active", "restricted", "blocked", "suspended"],
      default: "active",
    },

    // Restriction details
    restrictions: {
      canConnect: { type: Boolean, default: true },
      canChat: { type: Boolean, default: true },
      canTeach: { type: Boolean, default: true },
      canLearn: { type: Boolean, default: true },
    },

    // Admin notes about user
    adminNotes: String,

    // Warning count
    warningCount: { type: Number, default: 0 },

    // Last warning date
    lastWarningDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
