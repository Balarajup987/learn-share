import express from "express";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import { adminAuth, authenticateUser } from "../middleware/adminAuth.js";

const router = express.Router();

// Configure email transporter for admin notifications
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
});

// Function to send complaint notification to admin
const sendComplaintNotification = async (complaint) => {
  if (!process.env.ADMIN_EMAIL) {
    console.log(`🚨 New complaint received: ${complaint._id}`);
    console.log(`Complainant: ${complaint.complainant}`);
    console.log(`Reported User: ${complaint.reportedUser}`);
    console.log(`Subject: ${complaint.subject}`);
    return true;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `🚨 New Complaint: ${complaint.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚨 LearnShare Admin Alert</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">New User Complaint Received</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: #fff; border: 2px solid #ff6b6b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Complaint Details</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div>
                <h3 style="color: #666; margin: 0 0 10px 0; font-size: 14px;">COMPLAINT ID</h3>
                <p style="color: #333; font-weight: bold; margin: 0;">${
                  complaint._id
                }</p>
              </div>
              <div>
                <h3 style="color: #666; margin: 0 0 10px 0; font-size: 14px;">PRIORITY</h3>
                <p style="color: #ff6b6b; font-weight: bold; margin: 0; text-transform: uppercase;">${
                  complaint.priority
                }</p>
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #666; margin: 0 0 10px 0; font-size: 14px;">SUBJECT</h3>
              <p style="color: #333; font-weight: bold; margin: 0;">${
                complaint.subject
              }</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #666; margin: 0 0 10px 0; font-size: 14px;">DESCRIPTION</h3>
              <p style="color: #333; margin: 0; line-height: 1.6;">${
                complaint.description
              }</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <h3 style="color: #666; margin: 0 0 10px 0; font-size: 14px;">CATEGORY</h3>
                <p style="color: #333; font-weight: bold; margin: 0; text-transform: capitalize;">${complaint.category.replace(
                  "_",
                  " "
                )}</p>
              </div>
              <div>
                <h3 style="color: #666; margin: 0 0 10px 0; font-size: 14px;">DATE</h3>
                <p style="color: #333; margin: 0;">${new Date(
                  complaint.createdAt
                ).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div style="background: #e3f2fd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #1976d2; margin: 0 0 15px 0;">📋 Action Required</h3>
            <p style="color: #333; margin: 0; line-height: 1.6;">
              Please review this complaint in the admin dashboard and take appropriate action. 
              You can view user profiles, block users, or issue warnings based on the complaint severity.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:5173"
            }/admin/complaints" 
               style="background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review Complaint
            </a>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Complaint notification sent to admin`);
    return true;
  } catch (error) {
    console.error("Error sending complaint notification:", error);
    return false;
  }
};

// 🔹 Submit a complaint about another user
router.post("/submit", async (req, res) => {
  try {
    const {
      complainantId,
      reportedUserId,
      subject,
      description,
      category,
      complainantEmail,
      evidence = [],
    } = req.body;

    // Validate required fields
    if (
      !complainantId ||
      !reportedUserId ||
      !subject ||
      !description ||
      !category ||
      !complainantEmail
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
        success: false,
      });
    }

    // Check if both users exist
    const complainant = await User.findById(complainantId);
    const reportedUser = await User.findById(reportedUserId);

    if (!complainant || !reportedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check if complainant is trying to complain about themselves
    if (complainantId === reportedUserId) {
      return res.status(400).json({
        message: "You cannot file a complaint against yourself",
        success: false,
      });
    }

    // Check if users are connected (only connected users can report each other)
    // Skip this check for admin users
    if (complainant.role !== "admin") {
      const isConnected = complainant.connections.includes(reportedUserId) ||
                         reportedUser.connections.includes(complainantId);

      if (!isConnected) {
        return res.status(400).json({
          message: "You can only report users you are connected with",
          success: false,
        });
      }
    }

    // Create the complaint
    const complaint = new Complaint({
      complainant: complainantId,
      reportedUser: reportedUserId,
      subject,
      description,
      category,
      complainantEmail,
      reportedUserEmail: reportedUser.email,
      evidence,
      priority:
        category === "harassment" || category === "scam" ? "high" : "medium",
    });

    await complaint.save();

    // Send notification to admin
    await sendComplaintNotification(complaint);

    res.json({
      message:
        "Complaint submitted successfully. Admin will review it shortly.",
      success: true,
      complaintId: complaint._id,
    });
  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({
      message: "Error submitting complaint",
      success: false,
      error: error.message,
    });
  }
});

// 🔹 Get all complaints (Admin only)
router.get("/all", adminAuth, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("complainant", "name email")
      .populate("reportedUser", "name email status")
      .populate("handledBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({
      message: "Error fetching complaints",
      success: false,
      error: error.message,
    });
  }
});

// 🔹 Get complaint by ID (Admin only)
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("complainant", "name email status")
      .populate("reportedUser", "name email status adminNotes warningCount")
      .populate("handledBy", "name email");

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
        success: false,
      });
    }

    res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({
      message: "Error fetching complaint",
      success: false,
      error: error.message,
    });
  }
});

// 🔹 Update complaint status (Admin only)
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status, adminNotes, resolution } = req.body;
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
        success: false,
      });
    }

    complaint.status = status || complaint.status;
    complaint.adminNotes = adminNotes || complaint.adminNotes;
    complaint.resolution = resolution || complaint.resolution;
    complaint.handledBy = req.body.adminId; // Admin who handled it

    await complaint.save();

    res.json({
      message: "Complaint status updated successfully",
      success: true,
      complaint,
    });
  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({
      message: "Error updating complaint",
      success: false,
      error: error.message,
    });
  }
});

// 🔹 Block/Restrict user based on complaint (Admin only)
router.put("/:id/action", adminAuth, async (req, res) => {
  try {
    const { action, adminNotes, adminId } = req.body;
    const { id } = req.params;

    const complaint = await Complaint.findById(id).populate("reportedUser");

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
        success: false,
      });
    }

    const reportedUser = complaint.reportedUser;

    switch (action) {
      case "warning":
        reportedUser.warningCount = (reportedUser.warningCount || 0) + 1;
        reportedUser.lastWarningDate = new Date();
        complaint.resolution = "warning_issued";
        break;

      case "restrict":
        reportedUser.status = "restricted";
        reportedUser.restrictions.canConnect = false;
        reportedUser.restrictions.canChat = false;
        complaint.resolution = "user_restricted";
        break;

      case "block":
        reportedUser.status = "blocked";
        reportedUser.restrictions.canConnect = false;
        reportedUser.restrictions.canChat = false;
        reportedUser.restrictions.canTeach = false;
        reportedUser.restrictions.canLearn = false;
        complaint.resolution = "user_blocked";
        break;

      case "suspend":
        reportedUser.status = "suspended";
        complaint.resolution = "user_blocked";
        break;

      case "dismiss":
        complaint.resolution = "no_action";
        break;

      default:
        return res.status(400).json({
          message: "Invalid action",
          success: false,
        });
    }

    if (adminNotes) {
      reportedUser.adminNotes = adminNotes;
      complaint.adminNotes = adminNotes;
    }

    complaint.status = "resolved";
    complaint.handledBy = adminId;

    await reportedUser.save();
    await complaint.save();

    res.json({
      message: `User ${action}ed successfully`,
      success: true,
      user: reportedUser,
      complaint,
    });
  } catch (error) {
    console.error("Error taking action on user:", error);
    res.status(500).json({
      message: "Error taking action on user",
      success: false,
      error: error.message,
    });
  }
});

// 🔹 Get user's complaint history (Admin only)
router.get("/user/:userId/history", adminAuth, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      $or: [
        { complainant: req.params.userId },
        { reportedUser: req.params.userId },
      ],
    })
      .populate("complainant", "name email")
      .populate("reportedUser", "name email")
      .populate("handledBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Error fetching user complaint history:", error);
    res.status(500).json({
      message: "Error fetching user complaint history",
      success: false,
      error: error.message,
    });
  }
});

export default router;
