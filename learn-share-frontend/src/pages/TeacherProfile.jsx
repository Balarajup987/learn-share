import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function TeacherProfile() {
  const { teacherId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/teacher/${teacherId}`
        );
        setTeacher(res.data);
      } catch (err) {
        console.error("Error fetching teacher:", err);
      }
    };

    if (teacherId) fetchTeacher();
  }, [teacherId]);

  if (!teacher) return <p>Loading teacher profile...</p>;

  const hasRequested = teacher.requestsReceived
    ?.map((id) => id.toString())
    .includes(user?.id);

  const isConnected = teacher.connections
    ?.map((id) => id.toString())
    .includes(user?.id);

  const handleConnect = async () => {
    if (!user?.id) {
      alert("Please login to connect");
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5001/api/connection/send`,
        { userId: user.id, teacherId: teacher._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeacher((prev) => ({
        ...prev,
        requestsReceived: [...prev.requestsReceived, user.id],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnect = async () => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5001/api/connection/disconnect`,
        { userId: user.id, teacherId: teacher._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeacher((prev) => ({
        ...prev,
        connections: prev.connections.filter((id) => id !== user.id),
      }));
      alert("Disconnected successfully");
    } catch (err) {
      console.error("Error disconnecting:", err);
      alert("Error disconnecting");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">{teacher.name}</h2>
        <p className="text-gray-600 mb-2">{teacher.email}</p>
        <p className="text-gray-700 mb-4">{teacher.bio}</p>

        {teacher.idFile && (
          <img
            src={`http://localhost:5001/uploads/${teacher.idFile}`}
            alt={teacher.name}
            className="w-48 h-48 object-cover rounded-xl border mb-4"
          />
        )}

        {isConnected ? (
          <div className="flex gap-2">
            <button
              className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
              onClick={() => navigate(`/chat?teacher=${teacher._id}`)}
            >
              Chat
            </button>
            <button
              className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          </div>
        ) : hasRequested ? (
          <button className="w-full bg-yellow-500 text-white py-2 rounded-lg">
            Pending
          </button>
        ) : (
          <button
            className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition"
            onClick={handleConnect}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
