// routes/connectionRoutes.js
import express from "express";
import Teacher from "../models/Teacher.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Alternate body-based endpoint to avoid param issues
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { userId, teacherId } = req.body;

    if (!userId || !teacherId) {
      return res
        .status(400)
        .json({ message: "userId and teacherId are required" });
    }

    if (req.user._id !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (userId === teacherId) {
      return res
        .status(400)
        .json({ message: "You cannot send a request to yourself" });
    }

    const user = await User.findById(userId);
    const teacher = await Teacher.findById(teacherId);

    if (!user || !teacher)
      return res.status(404).json({ message: "User or Teacher not found" });

    if (teacher.requestsReceived.includes(userId)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    teacher.requestsReceived.push(userId);
    user.sentRequests.push(teacherId);

    await teacher.save();
    await user.save();

    res.json({ message: "Connection request sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Send connection request (from user to teacher)
router.post("/send/:fromId/:toId", authMiddleware, async (req, res) => {
  try {
    const { fromId, toId } = req.params;

    // Ensure logged-in user matches
    if (req.user._id !== fromId)
      return res.status(401).json({ message: "Unauthorized" });

    if (fromId === toId)
      return res
        .status(400)
        .json({ message: "You cannot send a request to yourself" });

    const user = await User.findById(fromId);
    const teacher = await Teacher.findById(toId);

    if (!user || !teacher)
      return res.status(404).json({ message: "User or Teacher not found" });

    if (teacher.requestsReceived.includes(fromId))
      return res.status(400).json({ message: "Request already sent" });

    teacher.requestsReceived.push(fromId);
    user.sentRequests.push(toId);

    await teacher.save();
    await user.save();

    res.json({ message: "Connection request sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept request (teacher accepts user's request)
router.post("/accept/:teacherId/:fromId", authMiddleware, async (req, res) => {
  try {
    const { teacherId, fromId } = req.params;

    if (req.user._id !== teacherId)
      return res.status(401).json({ message: "Unauthorized" });

    const teacher = await Teacher.findById(teacherId);
    const user = await User.findById(fromId);

    if (!teacher || !user)
      return res.status(404).json({ message: "User or Teacher not found" });

    teacher.requestsReceived = teacher.requestsReceived.filter(
      (id) => id.toString() !== fromId
    );
    user.sentRequests = user.sentRequests.filter(
      (id) => id.toString() !== teacherId
    );

    teacher.connections.push(fromId);
    user.connectedTeachers.push(teacherId);

    await teacher.save();
    await user.save();

    res.json({ message: "Connection accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject request (teacher rejects user's request)
router.post("/reject/:teacherId/:fromId", authMiddleware, async (req, res) => {
  try {
    const { teacherId, fromId } = req.params;

    if (req.user._id !== teacherId)
      return res.status(401).json({ message: "Unauthorized" });

    const teacher = await Teacher.findById(teacherId);
    const user = await User.findById(fromId);

    if (!teacher || !user)
      return res.status(404).json({ message: "User or Teacher not found" });

    teacher.requestsReceived = teacher.requestsReceived.filter(
      (id) => id.toString() !== fromId
    );
    user.sentRequests = user.sentRequests.filter(
      (id) => id.toString() !== teacherId
    );

    await teacher.save();
    await user.save();

    res.json({ message: "Connection request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get requests received for a teacher
router.get("/received/:teacherId", authMiddleware, async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (req.user._id !== teacherId)
      return res.status(401).json({ message: "Unauthorized" });

    const teacher = await Teacher.findById(teacherId).populate(
      "requestsReceived",
      "name email"
    );
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher.requestsReceived);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get requests received for the teacher account linked to a user
router.get("/received-by-user/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user._id !== userId)
      return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find teacher profile with same email as user
    const teacher = await Teacher.findOne({ email: user.email }).populate(
      "requestsReceived",
      "name email"
    );
    if (!teacher) return res.json([]); // no teacher profile => no requests

    res.json(teacher.requestsReceived);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept request by logged-in user (resolves teacher by user's email)
router.post("/accept-by-user", authMiddleware, async (req, res) => {
  try {
    const { userId, fromId } = req.body;
    if (req.user._id !== userId)
      return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const teacher = await Teacher.findOne({ email: user.email });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    teacher.requestsReceived = teacher.requestsReceived.filter(
      (id) => id.toString() !== fromId
    );
    teacher.connections.push(fromId);
    user.sentRequests = user.sentRequests.filter(
      (id) => id.toString() !== teacher._id.toString()
    );
    user.connectedTeachers.push(teacher._id);

    await teacher.save();
    await user.save();
    res.json({ message: "Connection accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject request by logged-in user (resolves teacher by user's email)
router.post("/reject-by-user", authMiddleware, async (req, res) => {
  try {
    const { userId, fromId } = req.body;
    if (req.user._id !== userId)
      return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const teacher = await Teacher.findOne({ email: user.email });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    teacher.requestsReceived = teacher.requestsReceived.filter(
      (id) => id.toString() !== fromId
    );
    user.sentRequests = user.sentRequests.filter(
      (id) => id.toString() !== teacher._id.toString()
    );

    await teacher.save();
    await user.save();
    res.json({ message: "Connection request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Disconnect user from teacher
router.post("/disconnect", authMiddleware, async (req, res) => {
  try {
    const { userId, teacherId } = req.body;
    if (req.user._id !== userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    const teacher = await Teacher.findById(teacherId);

    if (!user || !teacher) return res.status(404).json({ message: "User or Teacher not found" });

    // Remove from connections
    teacher.connections = teacher.connections.filter(id => id.toString() !== userId);
    user.connectedTeachers = user.connectedTeachers.filter(id => id.toString() !== teacherId);

    await teacher.save();
    await user.save();

    res.json({ message: "Disconnected successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
