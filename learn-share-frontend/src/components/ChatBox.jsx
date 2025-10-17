import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";
import axios from "axios";

function ChatBox({ onClose }) {
  const { user } = useAuth();
  const [partners, setPartners] = useState([]); // all chat partners
  const [currentPartner, setCurrentPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const chatEndRef = useRef(null);

  // Fetch all partners on load
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        // Example: fetch all teachers as potential chat partners
        const { data } = await axios.get("http://localhost:5001/api/teachers");
        setPartners(data);
      } catch (e) {
        console.error("Error fetching partners:", e);
      }
    };
    fetchPartners();
  }, []);

  // Join room & listen to messages
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (
        currentPartner &&
        (msg.senderId === currentPartner._id || msg.toTeacherId === currentPartner._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [currentPartner]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Select a partner
  const selectPartner = async (partner) => {
    setCurrentPartner(partner);
    const roomId = `${user.id}:${partner._id}`;
    socket.emit("joinRoom", roomId);

    // Fetch chat history
    try {
      const { data } = await axios.get(
        `http://localhost:5001/api/chat/history?userId=${user.id}&teacherId=${partner._id}`
      );
      const mapped = (data || []).map((m) => ({
        text: m.text,
        file: m.file,
        senderId: m.fromUserId,
        time: m.time,
      }));
      setMessages(mapped);
    } catch (e) {
      console.error("Error fetching history:", e);
      setMessages([]);
    }
  };

  const sendMessage = () => {
    if (!input && !file) return;
    if (!currentPartner) return;

    const messageData = {
      roomId: `${user.id}:${currentPartner._id}`,
      text: input || "",
      senderId: user.id,
      toTeacherId: currentPartner._id,
      time: new Date(),
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        messageData.file = { name: file.name, data: reader.result };
        socket.emit("sendMessage", messageData);
        setFile(null);
      };
      reader.readAsDataURL(file);
    } else {
      socket.emit("sendMessage", messageData);
    }

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar: Chat partners */}
      <div className="w-1/4 bg-gray-50 shadow-md border-r flex flex-col">
        <div className="bg-gray-100 p-3 flex justify-between items-center border-b">
          <h3 className="font-semibold text-gray-800">Chats</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-800" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {partners.map((p) => (
            <div
              key={p._id}
              className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer ${
                currentPartner?._id === p._id ? "bg-gray-200" : ""
              }`}
              onClick={() => selectPartner(p)}
            >
              <img
                src={
                  p.idFile
                    ? `http://localhost:5001/uploads/${p.idFile}`
                    : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                }
                alt={p.name}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {messages.find((m) => m.senderId === p._id)?.text || "No messages"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Section */}
      <div className="flex-1 flex flex-col border-l bg-white">
        {currentPartner ? (
          <>
            {/* Header */}
            <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
              <span>Chat with {currentPartner.name}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 && (
                <p className="text-gray-400 text-center">No messages yet...</p>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={i} className={`mb-4 flex ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && (
                      <img
                        src={
                          currentPartner.idFile
                            ? `http://localhost:5001/uploads/${currentPartner.idFile}`
                            : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                        }
                        alt={currentPartner.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    )}
                    <div
                      className={`p-3 rounded-lg max-w-xs ${
                        isMe ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.text && <p>{msg.text}</p>}
                      {msg.file && msg.file.data.startsWith("data:image") && (
                        <img src={msg.file.data} alt="sent" className="w-32 rounded mt-2" />
                      )}
                      {msg.file && msg.file.data.startsWith("data:audio") && (
                        <audio controls className="mt-2">
                          <source src={msg.file.data} type="audio/mpeg" />
                        </audio>
                      )}
                      <span className="text-xs block mt-1 opacity-70">
                        {new Date(msg.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {isMe && (
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                        alt="You"
                        className="w-8 h-8 rounded-full ml-2 object-cover"
                      />
                    )}
                  </div>
                );
              })}
              <div ref={chatEndRef}></div>
            </div>

            {/* Input */}
            <div className="flex items-center p-3 border-t bg-gray-50">
              <input
                type="file"
                accept="image/*,audio/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="mr-2"
              />
              <input
                type="text"
                placeholder="Type a message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button
                onClick={sendMessage}
                className="bg-indigo-600 text-white px-4 py-2 rounded ml-2 hover:bg-indigo-700 flex items-center"
              >
                <FaPaperPlane />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatBox;
