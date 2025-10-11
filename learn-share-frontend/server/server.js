// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js"; // your auth routes
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// --- 1️⃣ Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/your_db_name", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// --- 2️⃣ Mount auth routes
app.use("/api/auth", authRoutes);

// --- 3️⃣ Example REST routes
app.get("/api/teachers", (req, res) => {
  const teachers = [
    { id: 1, name: "John Doe", skill: "Math", level: "Beginner", experience: "2 years", description: "Passionate Math teacher", rating: 4, image: "https://via.placeholder.com/150" },
    { id: 2, name: "Jane Smith", skill: "Physics", level: "Intermediate", experience: "5 years", description: "Experienced Physics teacher", rating: 5, image: "https://via.placeholder.com/150" },
  ];
  res.json(teachers);
});

app.get("/api/skills", (req, res) => {
  res.json(["Math", "Physics", "Chemistry", "Biology"]);
});

// --- 4️⃣ Root test route
app.get("/", (req, res) => res.send("Server running"));

// --- 5️⃣ Create HTTP server and Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"], credentials: true },
});

// --- 6️⃣ Socket.IO connection
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("sendMessage", (msg) => {
    console.log("Message received:", msg);
    io.emit("receiveMessage", msg); // broadcast to all
  });

  socket.on("disconnect", () => console.log("❌ User disconnected:", socket.id));
});

// --- 7️⃣ Start server
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
