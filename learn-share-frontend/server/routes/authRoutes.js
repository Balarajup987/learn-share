import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/User.js";

const router = express.Router();

// Configure nodemailer for sending OTP emails
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use other services like 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com", // Replace with your email
    pass: process.env.EMAIL_PASS || "your-app-password", // Replace with your app password
  },
});

// Function to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send OTP email
const sendOTPEmail = async (email, otp) => {
  // Check if email credentials are configured
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_USER === "your-email@gmail.com" ||
    process.env.EMAIL_PASS === "your-app-password"
  ) {
    console.log(`🔑 OTP for ${email}: ${otp}`);
    console.log(
      "📧 Email not configured. Please set EMAIL_USER and EMAIL_PASS in .env file"
    );
    return true; // Return true for testing purposes
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset OTP - LearnShare",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 LearnShare</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Password Reset OTP</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You requested a password reset for your LearnShare account. Use the following OTP to reset your password:
          </p>
          
          <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h3>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            <strong>Important:</strong><br>
            • This OTP will expire in 10 minutes<br>
            • Do not share this OTP with anyone<br>
            • If you didn't request this reset, please ignore this email
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated message from LearnShare. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    console.log(
      `🔑 OTP for ${email}: ${otp} (Email failed, showing in console)`
    );
    return true; // Return true for testing purposes
  }
};

// 🔹 Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if user is blocked or suspended
    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked. Please contact support.",
        blocked: true,
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        message: "Your account has been suspended. Please contact support.",
        suspended: true,
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Forgot Password - Send OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 600000; // 10 minutes

    // Save OTP to user
    user.otp = otp;
    user.otpExpires = otpExpiry;
    await user.save();

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (emailSent) {
      res.json({
        message:
          "OTP sent to your email address. Please check your inbox and enter the 6-digit code.",
        success: true,
      });
    } else {
      res.status(500).json({
        message: "Failed to send OTP email. Please try again later.",
        success: false,
      });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP. Please request a new one.",
        success: false,
      });
    }

    // OTP is valid, return success
    res.json({
      message: "OTP verified successfully. You can now reset your password.",
      success: true,
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Reset Password with OTP
router.post("/reset-password-with-otp", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP first
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP. Please request a new one.",
        success: false,
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({
      message:
        "Password reset successful! You can now login with your new password.",
      success: true,
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 600000; // 10 minutes

    // Update OTP in database
    user.otp = otp;
    user.otpExpires = otpExpiry;
    await user.save();

    // Send new OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (emailSent) {
      res.json({
        message: "New OTP sent to your email address. Please check your inbox.",
        success: true,
      });
    } else {
      res.status(500).json({
        message: "Failed to send OTP email. Please try again later.",
        success: false,
      });
    }
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
