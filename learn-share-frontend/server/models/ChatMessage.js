import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    roomId: { type: String, index: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    toTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    text: String,
    file: {
      name: String,
      data: String, // base64 for simplicity
    },
    time: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);

