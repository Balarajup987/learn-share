import { io } from "socket.io-client";

const token = localStorage.getItem("token");

const socket = io("http://localhost:5001", {
  auth: {
    token, // send token with handshake
  },
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

export default socket;