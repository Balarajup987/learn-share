import { io } from "socket.io-client";

const token = localStorage.getItem("token");

const socketUrl = process.env.NODE_ENV === 'production'
  ? "https://learn-share-backend.onrender.com" // Your Render backend URL
  : "http://localhost:5001";

const socket = io(socketUrl, {
  auth: {
    token, // send token with handshake
  },
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

export default socket;