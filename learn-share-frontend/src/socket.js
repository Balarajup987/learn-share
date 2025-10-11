// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5001", { // ✅ updated port
  transports: ["websocket", "polling"], // ensures proper transport
});

socket.on("connect", () => {
  console.log("✅ Connected to server via Socket.IO");
});

export default socket;
