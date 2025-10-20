import express from "express";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create complaint
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { subject, description, category, priority } = req.body;
    const complaint = new Complaint({
      userId: req.user.id,
      subject,
      description,
      category,
      priority,
    });
    await complaint.save();
    res.status(201).json({ message: "Complaint submitted successfully", complaint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's complaints
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("assignedTo", "name");
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all complaints (admin only)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, priority, category } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .populate("assignedTo", "name");
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update complaint status (admin only)
router.patch("/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, resolution, assignedTo } = req.body;
    const updateData = { status };

    if (resolution) updateData.resolution = resolution;
    if (assignedTo) updateData.assignedTo = assignedTo;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("userId", "name email").populate("assignedTo", "name");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ message: "Complaint updated successfully", complaint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete complaint (admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;