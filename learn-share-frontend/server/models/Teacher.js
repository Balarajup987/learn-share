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
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
  requestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
  requestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
});

export default mongoose.model("Teacher", teacherSchema);
