import User from "../models/User.js";

// 📩 Send connection request (User to User)
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId, targetUserId } = req.body;

    if (!userId || !targetUserId)
      return res.status(400).json({ message: "userId and targetUserId are required" });

    if (userId === targetUserId)
      return res.status(400).json({ message: "You cannot send a request to yourself" });

    const user = await User.findById(userId);
    const target = await User.findById(targetUserId);

    if (!user || !target)
      return res.status(404).json({ message: "User not found" });

    // Check if already connected
    if (
      user.connections.some((id) => id.toString() === targetUserId.toString()) &&
      target.connections.some((id) => id.toString() === userId.toString())
    ) {
      return res.status(400).json({ message: "Already connected" });
    }

    // Check if request already sent
    if (
      target.requestsReceived.some((id) => id.toString() === userId.toString()) ||
      user.sentRequests.some((id) => id.toString() === targetUserId.toString())
    ) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Add to sentRequests and requestsReceived
    if (!user.sentRequests.some((id) => id.toString() === targetUserId.toString()))
      user.sentRequests.push(targetUserId);
    if (!target.requestsReceived.some((id) => id.toString() === userId.toString()))
      target.requestsReceived.push(userId);

    await user.save();
    await target.save();

    res.status(200).json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.error("Error sending connection request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { targetUserId, fromUserId } = req.body; // target accepts from fromUserId

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
    if (!target.connections.some((id) => id.toString() === fromUserId.toString()))
      target.connections.push(fromUserId);
    if (!fromUser.connections.some((id) => id.toString() === targetUserId.toString()))
      fromUser.connections.push(targetUserId);

    await target.save();
    await fromUser.save();

    res.status(200).json({ message: "Connection accepted successfully" });
  } catch (error) {
    console.error("Error accepting connection:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Get connection status
export const getConnectionStatus = async (req, res) => {
  try {
    const { userId, targetUserId } = req.params;

    const user = await User.findById(userId);
    const target = await User.findById(targetUserId);

    if (!user || !target) return res.status(404).json({ message: "User not found" });

    if (
      user.connections.some((id) => id.toString() === targetUserId.toString()) &&
      target.connections.some((id) => id.toString() === userId.toString())
    ) {
      return res.json({ status: "connected" });
    }
    if (
      target.requestsReceived.some((id) => id.toString() === userId.toString()) ||
      user.sentRequests.some((id) => id.toString() === targetUserId.toString())
    ) {
      return res.json({ status: "pending" });
    }
    return res.json({ status: "none" });
  } catch (error) {
    console.error("Error checking status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ Disconnect
export const disconnectConnection = async (req, res) => {
  try {
    const { userId, targetUserId } = req.body;

    const user = await User.findById(userId);
    const target = await User.findById(targetUserId);

    if (!user || !target)
      return res.status(404).json({ message: "User not found" });

    // Remove from connections both sides
    user.connections = user.connections.filter(
      (id) => id.toString() !== targetUserId
    );
    target.connections = target.connections.filter(
      (id) => id.toString() !== userId
    );

    await user.save();
    await target.save();

    res.status(200).json({ message: "Disconnected successfully" });
  } catch (error) {
    console.error("Error disconnecting:", error);
    res.status(500).json({ message: "Server error" });
  }
};
