import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import ChatMessage from "./models/ChatMessage.js";
import User from "./models/User.js"; // Added User import

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/learnshare", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/connection", connectionRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/complaints", complaintRoutes);

// Teachers & Skills (backed by unified User model)
app.get("/api/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: { $in: ["teacher", "both"] } });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/skills", (req, res) => {
  res.json(["Math", "Physics", "Chemistry", "Biology"]);
});

app.get("/", (req, res) => res.send("Server running"));

// HTTP + Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Unauthorized"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.userId);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  socket.on("sendMessage", async (payload) => {
    try {
      const { roomId, text, file, toTeacherId, toUserId } = payload;
      const recipientId = toUserId || toTeacherId; // back-compat for older clients

      if (!recipientId || recipientId === "") {
        console.error("Invalid recipient:", recipientId);
        return;
      }

      const message = new ChatMessage({
        roomId,
        fromUserId: socket.userId,
        toUserId: recipientId,
        text: text || "",
        file: file || null,
        time: new Date(),
      });
      await message.save();

      io.to(roomId).emit("receiveMessage", {
        text: message.text,
        file: message.file,
        senderId: socket.userId,
        time: message.time,
      });
    } catch (e) {
      console.error("sendMessage error", e);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.userId);
  });
});

// Chat history endpoint (unified user↔user)
app.get("/api/chat/history", async (req, res) => {
  try {
    const { userId, teacherId, otherUserId } = req.query;
    const peerId = otherUserId || teacherId;
    if (!userId || !peerId)
      return res
        .status(400)
        .json({ message: "userId and otherUserId required" });

    const messages = await ChatMessage.find({
      $or: [
        { fromUserId: userId, toUserId: peerId },
        { fromUserId: peerId, toUserId: userId },
      ],
    })
      .sort({ time: 1 }) // ascending
      .lean();

    res.json(messages);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user by ID
app.get("/api/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get teacher by email (unified)
app.get("/api/teacher/by-email/:email", async (req, res) => {
  try {
    const teacher = await User.findOne({
      email: req.params.email,
      role: { $in: ["teacher", "both"] },
    });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
