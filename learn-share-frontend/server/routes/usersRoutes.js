import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// GET /api/users/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user._id.toString() !== id.toString())
      return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(id)
      .populate("connections", "name email role idFile categories")
      .populate("requestsReceived", "name email role")
      .populate("sentRequests", "name email role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GET /api/users/:id error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/users/role  { role }
router.patch("/role", authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    const valid = ["student", "teacher", "both"];
    if (!valid.includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.role = role;
    await user.save();
    res.json({ message: "Role updated", role: user.role });
  } catch (err) {
    console.error("PATCH /api/users/role error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/users/profile - Update user profile
router.patch("/profile", authMiddleware, upload.single("idFile"), async (req, res) => {
  try {
    const updates = { ...req.body };

    // Parse categories if it's a string
    if (updates.categories && typeof updates.categories === "string") {
      updates.categories = JSON.parse(updates.categories);
    }

    // Handle file upload
    if (req.file) {
      updates.idFile = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("PATCH /api/users/profile error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/users - Get all users (admin only)
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    const currentUser = await User.findById(req.user._id);
    if (currentUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const users = await User.find({})
      .select("-password") // Exclude password
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("GET /api/users error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    const currentUser = await User.findById(req.user._id);
    if (currentUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/users/:id error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
