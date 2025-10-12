// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import authRoutes from "./middleware/auth.js"; // your auth routes
import teacherRoutes from "./routes/teacherRoutes.js"; // teacher registration routes

dotenv.config();

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// --- Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// --- Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/learnshare", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// --- Mount routes
app.use("/api/auth", authRoutes);       // Auth routes
app.use("/api/teacher", teacherRoutes); // Teacher registration & teacher-specific routes

// --- Example REST routes
import Teacher from "./models/Teacher.js";

// Get all teachers (optional, already handled in teacherRoutes.js if you want)
app.get("/api/teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ message: "Server error fetching teachers" });
  }
});

// Get all skills (static example)
app.get("/api/skills", (req, res) => {
  res.json(["Math", "Physics", "Chemistry", "Biology"]);
});

// Root test route
app.get("/", (req, res) => res.send("Server running"));

// --- HTTP server + Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"], credentials: true },
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("sendMessage", (msg) => {
    console.log("Message received:", msg);
    io.emit("receiveMessage", msg); // broadcast to all
  });

  socket.on("disconnect", () => console.log("❌ User disconnected:", socket.id));
});

// --- Start server
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));