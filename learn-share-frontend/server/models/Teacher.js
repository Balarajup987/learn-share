import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    categories: { type: [String], required: true },
    experience: { type: Number, default: 0 },
    bio: { type: String },
    mode: { type: String, enum: ["videos", "articles", "live", "projects"], default: "videos" },
    github: { type: String },
    linkedin: { type: String },
    website: { type: String },
    idFile: { type: String }, // store file name or URL if you implement file upload later
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;
