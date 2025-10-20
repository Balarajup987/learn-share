import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const DebugConnections = () => {
  const { user, isLoggedIn } = useAuth();
  const [userData, setUserData] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchData();
    }
  }, [isLoggedIn, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      console.log("User:", user);

      // Fetch user data
      const userResponse = await api.get(`/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User response:", userResponse.data);
      setUserData(userResponse.data);

      // Fetch connected teachers
      const connectedTeachers = userResponse.data.connectedTeachers || [];
      console.log("Connected teachers IDs:", connectedTeachers);

      const teacherDetails = await Promise.all(
        connectedTeachers.map(async (teacherId) => {
          try {
            console.log("Fetching teacher:", teacherId);
            const teacherResponse = await api.get(`/teacher/${teacherId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Teacher response:", teacherResponse.data);
            return teacherResponse.data;
          } catch (error) {
            console.error("Error fetching teacher:", error);
            return null;
          }
        })
      );

      console.log("Teacher details:", teacherDetails);
      setTeachers(teacherDetails.filter(Boolean));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <div>Please log in to see debug info</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Connections</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Data</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(userData, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Connected Teachers</h2>
        {teachers.length > 0 ? (
          <div className="space-y-4">
            {teachers.map((teacher, index) => (
              <div key={index} className="border p-4 rounded">
                <h3 className="font-semibold">{teacher.name}</h3>
                <p>Email: {teacher.email}</p>
                <p>Categories: {teacher.categories?.join(", ")}</p>
                <p>Experience: {teacher.experience}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No connected teachers found</p>
        )}
      </div>

      <button
        onClick={fetchData}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Refresh Data
      </button>
    </div>
  );
};

export default DebugConnections;
