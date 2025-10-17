import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import socket from "../socket"; // centralized socket
import axios from "axios";

function ChatBox({ onClose }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const teacherId = searchParams.get("teacher");
  const studentId = searchParams.get("student");
  const [chatPartner, setChatPartner] = useState({
    name: "Chat Partner",
    avatar: "/default.png",
    _id: "",
    type: "teacher",
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const chatEndRef = useRef(null);
  const [showHistory, setShowHistory] = useState(true);
  const partnerId = teacherId || studentId;
  const roomId = `${user?.id}:${partnerId}`;

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    if (!partnerId || !user?.id) return;

    // Fetch partner data (teacher or student)
    (async () => {
      try {
        if (teacherId) {
          const { data } = await axios.get(
            `http://localhost:5001/api/teacher/${teacherId}`
          );
          setChatPartner({ ...data, type: "teacher" });
        } else if (studentId) {
          const { data } = await axios.get(
            `http://localhost:5001/api/user/${studentId}`
          );
          setChatPartner({ ...data, type: "student" });
        }
      } catch (e) {
        console.error("Error fetching partner:", e);
      }
    })();

    socket.emit("joinRoom", roomId);
    // fetch history
    (async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5001/api/chat/history?userId=${user.id}&teacherId=${partnerId}`
        );
        const mapped = (data || []).map((m) => ({
          text: m.text,
          file: m.file,
          senderId: m.fromUserId,
          time: m.time,
        }));
        setMessages(mapped);
      } catch (e) {
        // ignore
      }
    })();
  }, [partnerId, user?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input && !file) return;
    if (!partnerId) {
      console.error("No partner ID");
      return;
    }

    const messageData = {
      roomId,
      text: input || "",
      sender: user.name,
      toTeacherId: partnerId,
      time: new Date(),
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        messageData.file = { name: file.name, data: reader.result };
        socket.emit("sendMessage", {
          ...messageData,
          file: { name: file.name, data: reader.result },
        });
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
      {/* WhatsApp-style Chat History Sidebar */}
      {showHistory && (
        <div className="w-1/4 bg-gray-50 shadow-md border-r flex flex-col">
          <div className="bg-gray-100 p-3 flex justify-between items-center border-b">
            <h3 className="font-semibold text-gray-800">Chats</h3>
            <button
              className="text-sm text-indigo-600 hover:text-indigo-800"
              onClick={() => setShowHistory(false)}
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {messages.length > 0 ? (
              <div className="p-2">
                <div className="bg-white rounded-lg shadow-sm p-3 mb-2 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        chatPartner.type === "teacher" && chatPartner.idFile
                          ? `http://localhost:5001/uploads/${chatPartner.idFile}`
                          : chatPartner.type === "teacher"
                          ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                          : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                      }
                      alt={chatPartner.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chatPartner.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {messages[messages.length - 1]?.text || "Attachment"}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(
                        messages[messages.length - 1]?.time
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No chat history yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teacher Profile Section */}
      <div className="w-1/4 bg-white shadow-md p-6 flex flex-col items-center">
        <img
          src={
            chatPartner.type === "teacher" && chatPartner.idFile
              ? `http://localhost:5001/uploads/${chatPartner.idFile}`
              : chatPartner.type === "teacher"
              ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
              : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
          }
          alt={chatPartner.name}
          className="w-24 h-24 rounded-full mb-4 border-4 border-indigo-600 object-cover"
        />
        <h2 className="text-xl font-semibold">{chatPartner.name}</h2>
        <p className="text-gray-500">Available for chat</p>
        {!showHistory && (
          <button
            className="mt-4 text-indigo-600"
            onClick={() => setShowHistory(true)}
          >
            Show History
          </button>
        )}
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col border-l bg-white">
        {/* Header */}
        <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
          <span>Chat with {chatPartner.name}</span>
          <button onClick={onClose}>
            <FaTimes className="text-white hover:text-gray-200" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-gray-400 text-center">No messages yet...</p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-4 flex ${
                msg.sender === user?.name ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender !== user?.name && (
                <img
                  src={
                    chatPartner.type === "teacher" && chatPartner.idFile
                      ? `http://localhost:5001/uploads/${chatPartner.idFile}`
                      : chatPartner.type === "teacher"
                      ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                      : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                  }
                  alt={chatPartner.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <div
                className={`p-3 rounded-lg max-w-xs ${
                  msg.sender === user?.name
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text && <p>{msg.text}</p>}
                {msg.file && msg.file.data.startsWith("data:image") && (
                  <img
                    src={msg.file.data}
                    alt="sent"
                    className="w-32 rounded mt-2"
                  />
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
              {msg.sender === user?.name && (
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                  alt="You"
                  className="w-8 h-8 rounded-full ml-2 object-cover"
                />
              )}
            </div>
          ))}
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
      </div>
    </div>
  );
}

export default ChatBox;
