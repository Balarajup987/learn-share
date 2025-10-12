import express from "express";
import Teacher from "../models/Teacher.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// --- Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure 'uploads' folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});
const upload = multer({ storage });

// POST /api/teacher/register
router.post("/register", upload.single("idFile"), async (req, res) => {
  try {
    const { name, email, categories, experience, bio, mode, github, linkedin, website } = req.body;

    if (!name || !email || !categories || categories.length === 0) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const teacher = new Teacher({
      name,
      email,
      categories: Array.isArray(categories) ? categories : categories.split(","), // handle CSV
      experience,
      bio,
      mode,
      github,
      linkedin,
      website,
      idFile: req.file ? `/uploads/${req.file.filename}` : "", // store file path
    });

    await teacher.save();
    res.status(201).json({ message: "Teacher registered successfully", teacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;