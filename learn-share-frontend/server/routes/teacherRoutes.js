import express from "express";
import User from "../models/User.js";
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

// === Register/Update Teacher Profile on User ===
router.post("/register", upload.single("idFile"), async (req, res) => {
  try {
    const {
      name,
      email,
      categories,
      experience,
      bio,
      mode,
      github,
      linkedin,
      website,
    } = req.body;

    if (!name || !email || !categories || categories.length === 0) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    let user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found for email" });

    user.name = name || user.name;
    user.role = user.role === "student" ? "both" : user.role; // upgrade role
    user.categories = Array.isArray(categories)
      ? categories
      : categories
      ? categories.split(",")
      : user.categories;
    user.experience = experience ?? user.experience;
    user.bio = bio ?? user.bio;
    user.mode = mode ?? user.mode;
    user.github = github ?? user.github;
    user.linkedin = linkedin ?? user.linkedin;
    user.website = website ?? user.website;
    if (req.file) user.idFile = req.file.filename;

    await user.save();
    res.status(201).json({ message: "Teacher profile updated", teacher: user });
  } catch (err) {
    console.error("Error registering teacher:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// === Get All Teachers ===
router.get("/", async (req, res) => {
  try {
    const teachers = await User.find({
      role: { $in: ["teacher", "both"] },
      status: { $ne: "blocked" } // Exclude blocked users
    });
    res.json(teachers);
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ message: "Error fetching teachers" });
  }
});

// === Get Single Teacher by ID ===
router.get("/:id", async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id);
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
    const teacher = await User.findById(req.params.teacherId).populate(
      "requestsReceived"
    );
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher.requestsReceived);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ message: "Error fetching requests" });
  }
});

export default router;
