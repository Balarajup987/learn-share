import express from "express";
import Teacher from "../models/Teacher.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// === Multer Setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure uploads folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});
const upload = multer({ storage });

// === Register Teacher ===
router.post("/register", upload.single("idFile"), async (req, res) => {
  try {
    const { name, email, categories, experience, bio, mode, github, linkedin, website } = req.body;

    if (!name || !email || !categories || categories.length === 0) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const teacher = new Teacher({
      name,
      email,
      categories: Array.isArray(categories) ? categories : categories.split(","),
      experience,
      bio,
      mode,
      github,
      linkedin,
      website,
      idFile: req.file ? req.file.filename : "", // store only file name
    });

    await teacher.save();
    res.status(201).json({ message: "Teacher registered successfully", teacher });
  } catch (err) {
    console.error("Error registering teacher:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// === Get All Teachers ===
router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ message: "Error fetching teachers" });
  }
});

// === Get Single Teacher by ID ===
router.get("/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher);
  } catch (err) {
    console.error("Error fetching teacher:", err);
    res.status(500).json({ message: "Error fetching teacher" });
  }
});

// === Get Pending Requests for Teacher ===
router.get("/requests/:teacherId", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.teacherId).populate("pendingRequests");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher.pendingRequests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ message: "Error fetching requests" });
  }
});

export default router;
