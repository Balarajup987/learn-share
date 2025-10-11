import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import socket from "../socket"; // centralized socket

function ChatBox({
  user = {
    name: "You",
    avatar:
      "https://plus.unsplash.com/premium_photo-1682091992663-2e4f4a5534ba?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFsZSUyMHN0dWRlbnR8ZW58MHx8MHx8fDA%3D",
  },
  teacher = { name: "Teacher", avatar: "/teacher.png" },
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const chatEndRef = useRef(null);

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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input && !file) return;

    const messageData = {
      text: input || "",
      sender: user.name,
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
      {/* Teacher Profile Section */}
      <div className="w-1/3 bg-white shadow-md p-6 flex flex-col items-center">
        <img
          src={teacher.avatar}
          alt={teacher.name}
          className="w-24 h-24 rounded-full mb-4 border-4 border-indigo-600"
        />
        <h2 className="text-xl font-semibold">{teacher.name}</h2>
        <p className="text-gray-500">Available for chat</p>
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col border-l bg-white">
        {/* Header */}
        <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
          <span>Chat about {teacher.name}</span>
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
                msg.sender === user.name ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender !== user.name && (
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <div
                className={`p-3 rounded-lg max-w-xs ${
                  msg.sender === user.name
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
              {msg.sender === user.name && (
                <img
                  src={user.avatar}
                  alt="You"
                  className="w-8 h-8 rounded-full ml-2"
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
