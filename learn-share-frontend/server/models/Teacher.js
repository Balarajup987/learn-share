import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  name: String,
  email: String,
  categories: [String],
  experience: String,
  bio: String,
  mode: String,
  github: String,
  linkedin: String,
  website: String,
  idFile: String,
  // Store User IDs here since connections are between users and teachers
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  requestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  requestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.model("Teacher", teacherSchema);
