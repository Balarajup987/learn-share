import express from "express";
import Teacher from "../models/Teacher.js"; // create a Teacher model
import { verifyToken } from "../middleware/auth.js"; // optional if only logged-in users can register

const router = express.Router();

// POST /api/teacher/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, categories, experience, bio, mode, github, linkedin, website } = req.body;
    
    // Validate required fields
    if (!name || !email || !categories || categories.length === 0) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const teacher = new Teacher({
      name,
      email,
      categories,
      experience,
      bio,
      mode,
      github,
      linkedin,
      website,
    });

    await teacher.save();
    res.status(201).json({ message: "Teacher registered successfully", teacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
