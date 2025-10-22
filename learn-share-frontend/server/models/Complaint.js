import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    // Who is making the complaint
    complainant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Who is being complained about
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Complaint details
    subject: {
      type: String,
      required: true,
      maxLength: 100,
    },

    description: {
      type: String,
      required: true,
      maxLength: 1000,
    },

    // Complaint category
    category: {
      type: String,
      enum: [
        "harassment",
        "inappropriate_behavior",
        "spam",
        "fake_profile",
        "scam",
        "other",
      ],
      required: true,
    },

    // Evidence/attachments
    evidence: [
      {
        type: String, // URLs to screenshots, messages, etc.
      },
    ],

    // Status tracking
    status: {
      type: String,
      enum: ["pending", "under_review", "resolved", "dismissed"],
      default: "pending",
    },

    // Admin actions
    adminNotes: {
      type: String,
      maxLength: 500,
    },

    // Resolution details
    resolution: {
      type: String,
      enum: [
        "warning_issued",
        "user_restricted",
        "user_blocked",
        "no_action",
        "pending",
      ],
      default: "pending",
    },

    // Who handled the complaint
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Priority level
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Contact email for complainant (optional)
    complainantEmail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ reportedUser: 1, status: 1 });
complaintSchema.index({ complainant: 1 });

export default mongoose.model("Complaint", complaintSchema);
