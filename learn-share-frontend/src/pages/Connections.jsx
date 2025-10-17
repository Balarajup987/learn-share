import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Connections() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!user?.id) return;

      try {
        const token = localStorage.getItem("token");

        // Get user's connected teachers
        const userRes = await axios.get(
          `http://localhost:5001/api/user/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const teacherIds = userRes.data.connectedTeachers || [];
        const teacherConnections = [];

        if (teacherIds.length > 0) {
          const teachersData = await Promise.all(
            teacherIds.map((id) =>
              axios.get(`http://localhost:5001/api/teacher/${id}`)
            )
          );
          teacherConnections.push(
            ...teachersData.map((res) => ({ ...res.data, type: "teacher" }))
          );
        }

        // Get user's teacher profile and their connected students
        try {
          const teacherRes = await axios.get(
            `http://localhost:5001/api/teacher/by-email/${user.email}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (teacherRes.data) {
            const studentIds = teacherRes.data.connections || [];
            if (studentIds.length > 0) {
              const studentsData = await Promise.all(
                studentIds.map((id) =>
                  axios.get(`http://localhost:5001/api/user/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  })
                )
              );
              teacherConnections.push(
                ...studentsData.map((res) => ({ ...res.data, type: "student" }))
              );
            }
          }
        } catch (err) {
          // User is not a teacher, that's fine
        }

        setConnections(teacherConnections);
      } catch (err) {
        console.error("Error fetching connections:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
          <p className="text-gray-600">Your connected teachers and students</p>
        </div>
      </div>

      {/* Connections List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {connections.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No connections yet
            </h3>
            <p className="mt-2 text-gray-500">
              Connect with teachers or students to start chatting
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/explore")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Explore Teachers
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {connections.map((connection) => (
              <div
                key={connection._id}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (connection.type === "teacher") {
                    navigate(`/chat?teacher=${connection._id}`);
                  } else {
                    // For students, we need to find their teacher profile
                    navigate(`/chat?student=${connection._id}`);
                  }
                }}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      connection.type === "teacher" && connection.idFile
                        ? `http://localhost:5001/uploads/${connection.idFile}`
                        : connection.type === "teacher"
                        ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
                        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
                    }
                    alt={connection.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {connection.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          connection.type === "teacher"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {connection.type === "teacher" ? "Teacher" : "Student"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {connection.type === "teacher"
                        ? connection.categories?.join(", ") || connection.email
                        : connection.email}
                    </p>
                    {connection.type === "teacher" && connection.experience && (
                      <p className="text-xs text-gray-400">
                        {connection.experience}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Connections;
