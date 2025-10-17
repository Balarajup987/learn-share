import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Explore() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth(); // ✅ use loading
  const skillFromCategory = location.state?.selectedSkill || "";

  const [teachers, setTeachers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [levels] = useState(["Beginner", "Intermediate", "Advanced"]);
  const [selectedSkill, setSelectedSkill] = useState(skillFromCategory);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [requests, setRequests] = useState({}); // { teacherId: "pending" | "accepted" }

  const getImageUrl = (idFile) => {
    if (!idFile) return "https://via.placeholder.com/300";
    if (idFile.startsWith("http")) return idFile;
    return `http://localhost:5001/uploads/${idFile}`;
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/teachers");
      const list = Array.isArray(res.data) ? res.data : [];

      // filter out logged-in user (match by email to avoid id domain mismatch)
      const filtered = user?.email
        ? list.filter((t) => t.email !== user.email)
        : list;

      // build requests map
      const reqMap = {};
      filtered.forEach((t) => {
        const pending = Array.isArray(t.requestsReceived)
          ? t.requestsReceived.map(String)
          : [];
        const connections = Array.isArray(t.connections)
          ? t.connections.map(String)
          : [];

        if (user && user.id) {
          if (connections.includes(user.id)) reqMap[t._id] = "accepted";
          else if (pending.includes(user.id)) reqMap[t._id] = "pending";
        }
      });

      setTeachers(filtered);
      setRequests(reqMap);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setTeachers([]);
      setRequests({});
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/skills");
      setSkills(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching skills:", err);
      setSkills([]);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchSkills();
  }, [user]);

  useEffect(() => {
    if (skillFromCategory) setSelectedSkill(skillFromCategory);
  }, [skillFromCategory]);

  const filteredTeachers = Array.isArray(teachers)
    ? teachers.filter(
        (teacher) =>
          (selectedSkill === "" ||
            teacher.categories?.includes(selectedSkill) ||
            teacher.skill === selectedSkill) &&
          (selectedLevel === "" || teacher.level === selectedLevel)
      )
    : [];

  const clearAllFilters = () => {
    setSelectedSkill("");
    setSelectedLevel("");
  };

  // ✅ Added loading guard inside handleConnect
  const handleConnect = async (teacherId) => {
    if (loading) return;
    if (!user) {
      alert("Please log in to send connection requests.");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5001/api/connection/send`,
        { userId: user.id, teacherId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRequests((prev) => ({ ...prev, [teacherId]: "pending" }));
    } catch (err) {
      console.error("Error sending request:", err);
      alert(err.response?.data?.message || "Error sending request");
    }
  };

  const handleDisconnect = async (teacherId) => {
    if (!user || !user._id) return;
    try {
      await axios.post("http://localhost:5001/api/connection/disconnect", {
        userId: user._id,
        teacherId,
      });
      const newReq = { ...requests };
      delete newReq[teacherId];
      setRequests(newReq);
    } catch (err) {
      console.error("Error disconnecting:", err);
      alert(err.response?.data?.message || "Error disconnecting");
    }
  };

  // ✅ Added loading screen before main render
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600 font-semibold">
          Loading, please wait...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row px-6 py-6 bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 bg-white rounded-lg shadow-lg p-6 mb-6 md:mb-0">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Skills</h3>
          {skills.map((skill) => (
            <label
              key={skill}
              className={`block mb-2 cursor-pointer ${
                selectedSkill === skill ? "font-bold text-green-600" : ""
              }`}
            >
              <input
                type="radio"
                name="skill"
                value={skill}
                onChange={() => setSelectedSkill(skill)}
                checked={selectedSkill === skill}
                className="mr-2"
              />
              {skill}
            </label>
          ))}
          <button
            className="mt-2 text-blue-500 text-sm hover:underline"
            onClick={() => setSelectedSkill("")}
          >
            Clear
          </button>
        </div>

        {/* Levels */}
        <div>
          <h3 className="font-semibold mb-2">Level</h3>
          {levels.map((level) => (
            <label
              key={level}
              className={`block mb-2 cursor-pointer ${
                selectedLevel === level ? "font-bold text-green-600" : ""
              }`}
            >
              <input
                type="radio"
                name="level"
                value={level}
                onChange={() => setSelectedLevel(level)}
                checked={selectedLevel === level}
                className="mr-2"
              />
              {level}
            </label>
          ))}
          <button
            className="mt-2 text-blue-500 text-sm hover:underline"
            onClick={() => setSelectedLevel("")}
          >
            Clear
          </button>
        </div>

        <button
          onClick={clearAllFilters}
          className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Clear All
        </button>
      </aside>

      {/* Teacher Cards */}
      <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ml-0 md:ml-6">
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <div
              key={teacher._id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition transform hover:scale-105 p-4 relative"
            >
              <img
                src={getImageUrl(teacher.idFile)}
                alt={teacher.name}
                className="w-full h-40 object-cover rounded-lg"
              />
              <h3 className="text-lg font-semibold mt-3">{teacher.name}</h3>
              <p className="text-gray-600 text-sm">
                {teacher.skill || teacher.categories?.join(", ")}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  {teacher.level}
                </span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  {teacher.experience}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                {teacher.bio || teacher.description}
              </p>
              <div className="mt-3 text-yellow-500">
                {"⭐".repeat(Math.floor(teacher.rating || 0))}
                <span className="text-gray-600 text-sm ml-1">
                  {teacher.rating || 0}
                </span>
              </div>

              {/* Chat and View Profile buttons */}
              <div className="flex gap-2 mt-4">
                {requests[teacher._id] === "accepted" ? (
                  <button
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                    onClick={() => navigate(`/chat?teacher=${teacher._id}`)}
                  >
                    Chat
                  </button>
                ) : (
                  <button
                    className="flex-1 bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition"
                    onClick={() => handleConnect(teacher._id)}
                  >
                    Connect
                  </button>
                )}

                <button
                  onClick={() =>
                    navigate(`/teacher/${teacher._id}`, { state: teacher })
                  }
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 text-lg">
            No teachers found
          </p>
        )}
      </div>
    </div>
  );
}

export default Explore;
