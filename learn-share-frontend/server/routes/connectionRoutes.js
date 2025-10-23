// routes/connectionRoutes.js
import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* -----------------------------------------
   Send connection request (User → User)
----------------------------------------- */
router.post("/send", authMiddleware, async (req, res) => {
  try {
    // Back-compat: accept teacherId or targetUserId
    const { userId, teacherId, targetUserId } = req.body;
    const toUserId = targetUserId || teacherId; // unified target

    if (!userId || !toUserId)
      return res
        .status(400)
        .json({ message: "userId and targetUserId are required" });

    if (req.user._id.toString() !== userId.toString())
      return res.status(401).json({ message: "Unauthorized" });

    if (userId === toUserId)
      return res
        .status(400)
        .json({ message: "You cannot send a request to yourself" });

    const user = await User.findById(userId);
    const target = await User.findById(toUserId);

    if (!user || !target)
      return res.status(404).json({ message: "User not found" });

    if (
      user.connections.some((id) => id.toString() === toUserId.toString()) &&
      target.connections.some((id) => id.toString() === userId.toString())
    ) {
      return res.json({ message: "Already connected" });
    }

    if (
      target.requestsReceived.some(
        (id) => id.toString() === userId.toString()
      ) ||
      user.sentRequests.some((id) => id.toString() === toUserId.toString())
    ) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Prevent duplicates
    if (!user.sentRequests.some((id) => id.toString() === toUserId.toString()))
      user.sentRequests.push(toUserId);
    if (
      !target.requestsReceived.some((id) => id.toString() === userId.toString())
    )
      target.requestsReceived.push(userId);

    await user.save();
    await target.save();

    res.json({ message: "Connection request sent successfully" });
  } catch (err) {
    console.error("Send request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------
   Accept request (Target → From)
----------------------------------------- */
router.post("/accept", authMiddleware, async (req, res) => {
  try {
    const { targetUserId, fromUserId } = req.body; // target accepts from fromUserId

    if (req.user._id.toString() !== targetUserId.toString())
      return res.status(401).json({ message: "Unauthorized" });

    const target = await User.findById(targetUserId);
    const fromUser = await User.findById(fromUserId);

    if (!target || !fromUser)
      return res.status(404).json({ message: "User not found" });

    // Remove from pending/sent
    target.requestsReceived = target.requestsReceived.filter(
      (id) => id.toString() !== fromUserId
    );
    fromUser.sentRequests = fromUser.sentRequests.filter(
      (id) => id.toString() !== targetUserId
    );

    // Add to connections both sides
    if (
      !target.connections.some((id) => id.toString() === fromUserId.toString())
    )
      target.connections.push(fromUserId);
    if (
      !fromUser.connections.some(
        (id) => id.toString() === targetUserId.toString()
      )
    )
      fromUser.connections.push(targetUserId);

    await target.save();
    await fromUser.save();

    res.json({ message: "Connection accepted" });
  } catch (err) {
    console.error("Accept request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------
   Reject request
----------------------------------------- */
router.post("/reject", authMiddleware, async (req, res) => {
  try {
    const { targetUserId, fromUserId } = req.body;

    if (req.user._id.toString() !== targetUserId.toString())
      return res.status(401).json({ message: "Unauthorized" });

    const target = await User.findById(targetUserId);
    const fromUser = await User.findById(fromUserId);

    if (!target || !fromUser)
      return res.status(404).json({ message: "User not found" });

    target.requestsReceived = target.requestsReceived.filter(
      (id) => id.toString() !== fromUserId
    );
    fromUser.sentRequests = fromUser.sentRequests.filter(
      (id) => id.toString() !== targetUserId
    );

    await target.save();
    await fromUser.save();

    res.json({ message: "Connection request rejected" });
  } catch (err) {
    console.error("Reject request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------
   Disconnect
----------------------------------------- */
router.post("/disconnect", authMiddleware, async (req, res) => {
  try {
    // Back-compat: accept teacherId or targetUserId
    const { userId, teacherId, targetUserId } = req.body;
    const otherUserId = targetUserId || teacherId;

    if (req.user._id.toString() !== userId.toString())
      return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    const other = await User.findById(otherUserId);

    if (!user || !other)
      return res.status(404).json({ message: "User not found" });

    user.connections = user.connections.filter(
      (id) => id.toString() !== otherUserId
    );
    other.connections = other.connections.filter(
      (id) => id.toString() !== userId
    );

    await user.save();
    await other.save();

    res.json({ message: "Disconnected successfully" });
  } catch (err) {
    console.error("Disconnect error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------
   Get pending requests for teacher
----------------------------------------- */
router.get("/received/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString())
      return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).populate(
      "requestsReceived",
      "name email"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.requestsReceived);
  } catch (err) {
    console.error("Fetch received error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all connections for a user
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user._id.toString() !== userId.toString())
      return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).populate({
      path: "connections",
      select: "name email role categories bio experience status",
      match: { status: { $ne: "blocked" } } // Exclude blocked users
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Filter out null connections (those that were blocked)
    const filteredConnections = user.connections.filter(conn => conn !== null);

    res.json({ connections: filteredConnections });
  } catch (err) {
    console.error("Error fetching user connections:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
