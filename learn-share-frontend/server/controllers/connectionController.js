import User from "../models/User.js";
import Teacher from "../models/Teacher.js";

// 📩 Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId, teacherId } = req.body;

    const user = await User.findById(userId);
    const teacher = await Teacher.findById(teacherId);

    if (!user || !teacher)
      return res.status(404).json({ message: "User or Teacher not found" });

    if (teacher.pendingRequests.includes(userId))
      return res.status(400).json({ message: "Request already sent" });

    if (teacher.followers.includes(userId))
      return res.status(400).json({ message: "Already connected" });

    teacher.pendingRequests.push(userId);
    user.sentRequests.push(teacherId);

    await teacher.save();
    await user.save();

    res.status(200).json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.error("Error sending connection request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId, teacherId } = req.body;

    const user = await User.findById(userId);
    const teacher = await Teacher.findById(teacherId);

    if (!user || !teacher)
      return res.status(404).json({ message: "User or Teacher not found" });

    // Remove from pendingRequests and add to followers
    teacher.pendingRequests = teacher.pendingRequests.filter(
      (id) => id.toString() !== userId
    );
    teacher.followers.push(userId);

    // Add to connectedTeachers for user
    user.connectedTeachers.push(teacherId);

    await teacher.save();
    await user.save();

    res.status(200).json({ message: "Connection accepted successfully" });
  } catch (error) {
    console.error("Error accepting connection:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Get connection status
export const getConnectionStatus = async (req, res) => {
  try {
    const { userId, teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    if (teacher.followers.includes(userId)) return res.json({ status: "connected" });
    if (teacher.pendingRequests.includes(userId)) return res.json({ status: "pending" });
    return res.json({ status: "none" });
  } catch (error) {
    console.error("Error checking status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ Disconnect
export const disconnectConnection = async (req, res) => {
  try {
    const { userId, teacherId } = req.body;

    const user = await User.findById(userId);
    const teacher = await Teacher.findById(teacherId);

    if (!user || !teacher)
      return res.status(404).json({ message: "User or Teacher not found" });

    teacher.followers = teacher.followers.filter((id) => id.toString() !== userId);
    user.connectedTeachers = user.connectedTeachers.filter(
      (id) => id.toString() !== teacherId
    );

    await teacher.save();
    await user.save();

    res.status(200).json({ message: "Disconnected successfully" });
  } catch (error) {
    console.error("Error disconnecting:", error);
    res.status(500).json({ message: "Server error" });
  }
};
