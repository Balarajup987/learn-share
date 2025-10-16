import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // 🆕 NEW FIELDS
    sentRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }
    ], // connection requests sent by user

    connectedTeachers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }
    ], // accepted connections
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
