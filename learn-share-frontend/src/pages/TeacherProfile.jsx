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
        const res = await axios.get(`http://localhost:5001/api/teacher/${teacherId}`);
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
    .includes(user?._id);

  const isConnected = teacher.connections
    ?.map((id) => id.toString())
    .includes(user?._id);

  const handleConnect = async () => {
    if (!user?._id) {
      alert("Please login to connect");
      navigate("/login");
      return;
    }

    try {
      await axios.post(`http://localhost:5001/api/connection/send/${user._id}/${teacher._id}`);
      setTeacher((prev) => ({
        ...prev,
        requestsReceived: [...prev.requestsReceived, user._id],
      }));
    } catch (err) {
      console.error(err);
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
          <button
            className="w-full bg-green-500 text-white py-2 rounded-lg"
            onClick={() => navigate(`/chat?teacher=${teacher._id}`)}
          >
            Chat
          </button>
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
