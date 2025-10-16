// routes/connectionRoutes.js
import express from "express";
import Teacher from "../models/Teacher.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Send connection request
router.post("/send/:fromId/:toId", authMiddleware, async (req, res) => {
  try {
    const { fromId, toId } = req.params;

    // Ensure logged-in user matches
    if (req.user._id !== fromId)
      return res.status(401).json({ message: "Unauthorized" });

    if (fromId === toId)
      return res.status(400).json({ message: "You cannot send a request to yourself" });

    const fromTeacher = await Teacher.findById(fromId);
    const toTeacher = await Teacher.findById(toId);

    if (!fromTeacher || !toTeacher)
      return res.status(404).json({ message: "Teacher not found" });

    if (toTeacher.requestsReceived.includes(fromId))
      return res.status(400).json({ message: "Request already sent" });

    toTeacher.requestsReceived.push(fromId);
    fromTeacher.requestsSent.push(toId);

    await toTeacher.save();
    await fromTeacher.save();

    res.json({ message: "Connection request sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept request
router.post("/accept/:teacherId/:fromId", authMiddleware, async (req, res) => {
  try {
    const { teacherId, fromId } = req.params;

    if (req.user._id !== teacherId)
      return res.status(401).json({ message: "Unauthorized" });

    const teacher = await Teacher.findById(teacherId);
    const fromTeacher = await Teacher.findById(fromId);

    teacher.requestsReceived = teacher.requestsReceived.filter(id => id.toString() !== fromId);
    fromTeacher.requestsSent = fromTeacher.requestsSent.filter(id => id.toString() !== teacherId);

    teacher.connections.push(fromId);
    fromTeacher.connections.push(teacherId);

    await teacher.save();
    await fromTeacher.save();

    res.json({ message: "Connection accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject request
router.post("/reject/:teacherId/:fromId", authMiddleware, async (req, res) => {
  try {
    const { teacherId, fromId } = req.params;

    if (req.user._id !== teacherId)
      return res.status(401).json({ message: "Unauthorized" });

    const teacher = await Teacher.findById(teacherId);
    const fromTeacher = await Teacher.findById(fromId);

    teacher.requestsReceived = teacher.requestsReceived.filter(id => id.toString() !== fromId);
    fromTeacher.requestsSent = fromTeacher.requestsSent.filter(id => id.toString() !== teacherId);

    await teacher.save();
    await fromTeacher.save();

    res.json({ message: "Connection request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get requests received
router.get("/received/:teacherId", authMiddleware, async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (req.user._id !== teacherId)
      return res.status(401).json({ message: "Unauthorized" });

    const teacher = await Teacher.findById(teacherId).populate("requestsReceived", "name email");
    res.json(teacher.requestsReceived);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
