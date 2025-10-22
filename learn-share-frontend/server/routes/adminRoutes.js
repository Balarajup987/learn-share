import express from "express";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// All routes in this file require admin authentication
router.use(adminAuth);

// 🔹 Get all users with filtering and pagination
router.get("/users", async (req, res) => {
  try {
    const { status, role, search, page = 1, limit = 50 } = req.query;

    // Build query
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (role && role !== "all") {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select("-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Error fetching users",
      success: false,
      error: error.message,
    });
  }
});

// 🔹 Get user by ID with complete details
router.get("/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Get complaint statistics for this user
    const complaintsAgainst = await Complaint.countDocuments({
      reportedUser: user._id,
    });

    const complaintsMade = await Complaint.countDocuments({
      complainant: user._id,
    });

    const pendingComplaints = await Complaint.countDocuments({
      reportedUser: user._id,
      status: { $in: ["pending", "under_review"] },
    });

    res.json({
      success: true,
      user,
      statistics: {
        complaintsAgainst,
        complaintsMade,
        pendingComplaints,
        connectionsCount: user.connections?.length || 0,
        requestsReceived: user.requestsReceived?.length || 0,
        sentRequests: user.sentRequests?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "Error fetching user",
      success: false,
      error: error.message,
    });
  }
});

// 🔹 Update user status (block, suspend, restrict, activate)
router.put("/users/:userId/status", async (req, res) => {
  try {
    const { status, adminNotes, restrictions } = req.body;
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Prevent admin from blocking themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        message: "You cannot modify your own account status",
        success: false,
      });
    }

    // Update status
    if (status) {
      user.status = status;

      // Apply restrictions based on status
      if (status === "blocked") {
        user.restrictions = {
          canConnect: false,
          canChat: false,
          canTeach: false,
          canLearn: false,
        };
      } else if (status === "restricted") {
        user.restrictions = restrictions || {
          canConnect: false,
          canChat: false,
          canTeach: true,
          canLearn: true,
        };
      } else if (status === "suspended") {
        user.restrictions = {
          canConnect: false,
          canChat: false,
          canTeach: false,
          canLearn: false,
        };
      } else if (status === "active") {
        user.restrictions = {
          canConnect: true,
          canChat: true,
          canTeach: true,
          canLearn: true,
        };
      }
    }

    if (adminNotes) {
      user.adminNotes = adminNotes;
    }

    await user.save();

    res.json({
      message: `User status updated to ${status}`,
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        restrictions: user.restrictions,
      },
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      message: "Error updating user status",
      success: false,
      error: error.message,
    });
  }
});

// 🔹 Issue warning to user
router.post("/users/:userId/warning", async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    user.warningCount = (user.warningCount || 0) + 1;
    user.lastWarningDate = new Date();

    if (adminNotes) {
      user.adminNotes = adminNotes;
    }

    await user.save();

    res.json({
      message: `Warning issued to ${user.name}. Total warnings: ${user.warningCount}`,
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        warningCount: user.warningCount,
        lastWarningDate: user.lastWarningDate,
      },
    });
  } catch (error) {
    console.error("Error issuing warning:", error);
    res.status(500).json({
      message: "Error issuing warning",
      success: false,
      error: error.message,
    });
  }
});

// 🔹 Delete user account (permanent)
router.delete("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
        success: false,
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Optionally, delete all complaints related to this user
    await Complaint.deleteMany({
      $or: [{ complainant: userId }, { reportedUser: userId }],
    });

    res.json({
      message: `User ${user.name} and all related data have been permanently deleted`,
      success: true,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: "Error deleting user",
      success: false,
      error: error.message,
    });
  }
});

// 🔹 Get platform statistics
router.get("/statistics", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const blockedUsers = await User.countDocuments({ status: "blocked" });
    const restrictedUsers = await User.countDocuments({ status: "restricted" });
    const suspendedUsers = await User.countDocuments({ status: "suspended" });

    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({
      status: "pending",
    });
    const resolvedComplaints = await Complaint.countDocuments({
      status: "resolved",
    });
    const underReviewComplaints = await Complaint.countDocuments({
      status: "under_review",
    });

    const highPriorityComplaints = await Complaint.countDocuments({
      priority: { $in: ["high", "urgent"] },
      status: { $in: ["pending", "under_review"] },
    });

    // Get recent complaints (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentComplaints = await Complaint.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Get users by role
    const students = await User.countDocuments({ role: "student" });
    const teachers = await User.countDocuments({ role: "teacher" });
    const both = await User.countDocuments({ role: "both" });
    const admins = await User.countDocuments({ role: "admin" });

    res.json({
      success: true,
      statistics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers,
          restricted: restrictedUsers,
          suspended: suspendedUsers,
          byRole: {
            students,
            teachers,
            both,
            admins,
          },
        },
        complaints: {
          total: totalComplaints,
          pending: pendingComplaints,
          underReview: underReviewComplaints,
          resolved: resolvedComplaints,
          highPriority: highPriorityComplaints,
          recent: recentComplaints,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({
      message: "Error fetching statistics",
      success: false,
      error: error.message,
    });
  }
});

// 🔹 Bulk user actions
router.post("/users/bulk-action", async (req, res) => {
  try {
    const { userIds, action, adminNotes } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        message: "User IDs array is required",
        success: false,
      });
    }

    // Prevent admin from affecting themselves
    if (userIds.includes(req.user.id)) {
      return res.status(400).json({
        message: "You cannot perform bulk actions on your own account",
        success: false,
      });
    }

    let updateQuery = {};

    switch (action) {
      case "block":
        updateQuery = {
          status: "blocked",
          "restrictions.canConnect": false,
          "restrictions.canChat": false,
          "restrictions.canTeach": false,
          "restrictions.canLearn": false,
        };
        break;
      case "restrict":
        updateQuery = {
          status: "restricted",
          "restrictions.canConnect": false,
          "restrictions.canChat": false,
        };
        break;
      case "activate":
        updateQuery = {
          status: "active",
          "restrictions.canConnect": true,
          "restrictions.canChat": true,
          "restrictions.canTeach": true,
          "restrictions.canLearn": true,
        };
        break;
      case "suspend":
        updateQuery = {
          status: "suspended",
        };
        break;
      default:
        return res.status(400).json({
          message: "Invalid action",
          success: false,
        });
    }

    if (adminNotes) {
      updateQuery.adminNotes = adminNotes;
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateQuery }
    );

    res.json({
      message: `Bulk action "${action}" completed successfully`,
      success: true,
      affectedUsers: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    res.status(500).json({
      message: "Error performing bulk action",
      success: false,
      error: error.message,
    });
  }
});

export default router;
