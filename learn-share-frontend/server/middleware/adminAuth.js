import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to check if user is authenticated and is an admin
export const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - No token provided",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized - User not found",
        success: false,
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden - Admin access required",
        success: false,
      });
    }

    // Check if admin account is blocked
    if (user.status === "blocked" || user.status === "suspended") {
      return res.status(403).json({
        message: "Your account has been blocked",
        success: false,
      });
    }

    req.user = {
      _id: user._id,
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",
      success: false,
    });
  }
};

// Middleware to check if user is authenticated (not necessarily admin)
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - No token provided",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized - User not found",
        success: false,
      });
    }

    req.user = {
      _id: user._id,
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",
      success: false,
    });
  }
};
