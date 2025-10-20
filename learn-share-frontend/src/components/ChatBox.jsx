import React, { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaPaperPlane,
  FaSearch,
  FaUser,
  FaGraduationCap,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
import { fetchUserConnections, fetchChatHistory } from "../api";

function ChatBox({ onClose }) {
  const { user } = useAuth();
  const { teacherId, studentId } = useParams();
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]); // all chat partners
  const [currentPartner, setCurrentPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  // Fetch all connections (teachers and students)
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);

        // Fetch user connections using the new API
        const response = await fetchUserConnections(user.id);
        const connectionsData = response.data.connections || [];

        // Map connections with additional data
        const populated = connectionsData.map((c) => ({
          ...c,
          type:
            c.role === "teacher" || c.role === "both" ? "teacher" : "student",
          lastMessage: c.lastMessage || "Say hello!",
          lastMessageTime: new Date(),
          isOnline: Math.random() > 0.3,
        }));

        const allConnections = populated
          .filter((connection) => connection._id !== user.id)
          .sort(
            (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
          );

        setPartners(allConnections);

        // If teacherId or studentId is in URL, select that partner
        if (teacherId || studentId) {
          const partnerId = teacherId || studentId;
          const partner = allConnections.find((p) => p._id === partnerId);
          if (partner) {
            selectPartner(partner);
          }
        }
      } catch (error) {
        console.error("Error fetching connections:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConnections();
    }
  }, [user, teacherId, studentId]);

  // Join room & listen to messages
  useEffect(() => {
    console.log("Socket connected:", socket.connected);

    socket.on("receiveMessage", (msg) => {
      console.log("Received message:", msg);
      console.log("Current partner:", currentPartner);
      console.log("User ID:", user.id);

      // Check if message is for current conversation
      const isForCurrentConversation =
        currentPartner &&
        (msg.senderId === currentPartner._id ||
          msg.senderId === user.id ||
          msg.toTeacherId === currentPartner._id);

      if (isForCurrentConversation) {
        console.log("Adding message to state");
        setMessages((prev) => [...prev, msg]);
      } else {
        console.log("Message not for current conversation");
      }
    });

    socket.on("connect", () => {
      console.log("Socket connected in ChatBox");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected in ChatBox");
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [currentPartner]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Select a partner
  const selectPartner = async (partner) => {
    console.log("Selecting partner:", partner);
    setCurrentPartner(partner);
    const roomId = `${user.id}:${partner._id}`;
    console.log("Joining room:", roomId);
    socket.emit("joinRoom", roomId);

    // Fetch chat history
    try {
      console.log("Fetching chat history for:", user.id, partner._id);
      const { data } = await fetchChatHistory(user.id, partner._id);
      console.log("Chat history data:", data);
      const mapped = (data || []).map((m) => ({
        text: m.text,
        file: m.file,
        senderId: m.fromUserId,
        time: m.time,
      }));
      console.log("Mapped messages:", mapped);
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

    console.log("Sending message:", messageData);

    // Add message to local state immediately
    const localMessage = {
      text: messageData.text,
      file: messageData.file,
      senderId: messageData.senderId,
      time: messageData.time,
    };
    setMessages((prev) => [...prev, localMessage]);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        messageData.file = { name: file.name, data: reader.result };
        console.log("Emitting sendMessage with file:", messageData);
        socket.emit("sendMessage", messageData);
        setFile(null);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("Emitting sendMessage:", messageData);
      socket.emit("sendMessage", messageData);
    }

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const formatLastMessageTime = (date) => {
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredPartners = partners.filter(
    (partner) =>
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.categories?.some((cat) =>
        cat.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading connections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar: Chat partners */}
      <div className="w-1/3 bg-white shadow-lg border-r flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Messages</h3>
            <button
              className="text-white hover:text-gray-200 transition-colors"
              onClick={onClose}
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            />
          </div>
        </div>

        {/* Partners List */}
        <div className="flex-1 overflow-y-auto">
          {filteredPartners.length > 0 ? (
            filteredPartners.map((partner) => (
              <div
                key={partner._id}
                className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                  currentPartner?._id === partner._id
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
                onClick={() => selectPartner(partner)}
              >
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      partner.type === "teacher"
                        ? "bg-gradient-to-r from-green-500 to-blue-500"
                        : "bg-gradient-to-r from-purple-500 to-pink-500"
                    }`}
                  >
                    {partner.name?.charAt(0)}
                  </div>
                  {partner.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 ml-3 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {partner.name}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatLastMessageTime(partner.lastMessageTime)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        partner.type === "teacher"
                          ? "bg-green-100 text-green-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {partner.type === "teacher" ? (
                        <>
                          <FaGraduationCap className="w-3 h-3 mr-1" />
                          Teacher
                        </>
                      ) : (
                        <>
                          <FaUser className="w-3 h-3 mr-1" />
                          Student
                        </>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {partner.categories?.slice(0, 2).join(", ")}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 truncate">
                    {partner.lastMessage}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-sm">No conversations found</p>
              <p className="text-xs text-gray-400 mt-1">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Start a conversation"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Section */}
      <div className="flex-1 flex flex-col bg-white">
        {currentPartner ? (
          <>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    currentPartner.type === "teacher"
                      ? "bg-gradient-to-r from-green-500 to-blue-500"
                      : "bg-gradient-to-r from-purple-500 to-pink-500"
                  }`}
                >
                  {currentPartner.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{currentPartner.name}</h3>
                  <p className="text-sm text-blue-100">
                    {currentPartner.type === "teacher" ? "Teacher" : "Student"}{" "}
                    •{currentPartner.isOnline ? " Online" : " Offline"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/teacher/${currentPartner._id}`)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                View Profile
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <p className="text-lg font-medium">Start a conversation</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Send a message to begin chatting with {currentPartner.name}
                  </p>
                </div>
              )}

              {messages.map((msg, i) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div
                    key={i}
                    className={`mb-4 flex ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                        isMe ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {!isMe && (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            currentPartner.type === "teacher"
                              ? "bg-gradient-to-r from-green-500 to-blue-500"
                              : "bg-gradient-to-r from-purple-500 to-pink-500"
                          }`}
                        >
                          {currentPartner.name?.charAt(0)}
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          isMe
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            : "bg-white text-gray-800 shadow-sm border"
                        }`}
                      >
                        {msg.text && <p className="text-sm">{msg.text}</p>}
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
                        <span
                          className={`text-xs block mt-1 ${
                            isMe ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {new Date(msg.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {isMe && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {user.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef}></div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept="image/*,audio/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                >
                  📎
                </label>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input && !file}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-full hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  <FaPaperPlane size={16} />
                </button>
              </div>
              {file && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {file.name}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-lg font-medium mb-2">
                Select a conversation
              </h3>
              <p className="text-sm text-gray-400">
                Choose someone from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatBox;
