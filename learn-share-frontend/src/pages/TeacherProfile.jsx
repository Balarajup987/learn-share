import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaStar, FaEnvelope, FaPhone, FaCheckCircle } from "react-icons/fa";
import ChatBox from "../components/ChatBox"; // Import ChatBox

function TeacherProfile() {
  const { id } = useParams();
  const { state } = useLocation(); // teacher data from Explore
  const navigate = useNavigate();

  const [status, setStatus] = useState("none"); // none, pending, connected

  const teacher = state;

  if (!teacher)
    return (
      <p className="text-center text-lg mt-10 text-red-500">
        No teacher data found. Please go back.
      </p>
    );

  const handleConnect = () => setStatus("pending");
  const handleAccept = () => setStatus("connected");
  const handleDisconnect = () => setStatus("none");

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold"
      >
        ← Back
      </button>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Image & Buttons */}
        <div className="flex flex-col items-center md:items-start">
          <img
            src={teacher.image}
            alt={teacher.name}
            className="w-48 h-48 rounded-full object-cover shadow-md"
          />
          <div className="mt-4 flex flex-col gap-3 w-full">
            {status === "none" && (
              <button
                onClick={handleConnect}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Connect
              </button>
            )}

            {status === "pending" && (
              <>
                <button className="bg-yellow-500 text-white px-6 py-2 rounded-lg">
                  Pending
                </button>
                <button
                  onClick={handleAccept}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Simulate Accept
                </button>
              </>
            )}

            {status === "connected" && (
              <>
                <button
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg"
                  onClick={() => {
                    const chatSection = document.getElementById("chat-section");
                    chatSection.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Chat
                </button>
                <button
                  onClick={handleDisconnect}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg"
                >
                  Disconnect
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold flex items-center gap-2">
            {teacher.name}
            <FaCheckCircle className="text-blue-500" />
          </h1>
          <p className="text-gray-600 text-lg">
            {teacher.skill} • {teacher.level}
          </p>
          <p className="text-gray-500">{teacher.experience}</p>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1 text-yellow-500">
            {Array.from({ length: Math.floor(teacher.rating) }).map((_, i) => (
              <FaStar key={i} />
            ))}
            <span className="text-gray-600 ml-2">{teacher.rating}</span>
          </div>

          {/* Bio */}
          <p className="mt-4 text-gray-700">{teacher.description}</p>

          {/* Contact Info */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <h3 className="text-gray-700 font-semibold">Email</h3>
              <p className="text-gray-600 flex items-center gap-2">
                <FaEnvelope /> teacher@example.com
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <h3 className="text-gray-700 font-semibold">Phone</h3>
              <p className="text-gray-600 flex items-center gap-2">
                <FaPhone /> +91 98765 43210
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Skills & Expertise</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          {teacher.skill === "Programming" && (
            <>
              <li>Java, Python, C++ Fundamentals</li>
              <li>Problem-Solving & Algorithms</li>
              <li>Data Structures Mastery</li>
            </>
          )}
          {teacher.skill === "Web Development" && (
            <>
              <li>React, Next.js, Tailwind CSS</li>
              <li>Responsive Design & UI/UX</li>
              <li>Node.js & Express Basics</li>
            </>
          )}
          {teacher.skill === "AI/ML" && (
            <>
              <li>Deep Learning & Neural Networks</li>
              <li>Model Training & Optimization</li>
              <li>Python (TensorFlow, PyTorch)</li>
            </>
          )}
        </ul>
      </div>

      {/* Chat Section */}
      {status === "connected" && (
        <div id="chat-section" className="mt-10">
          <ChatBox teacherName={teacher.name} studentName="You" />
        </div>
      )}
    </div>
  );
}

export default TeacherProfile;
