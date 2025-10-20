import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api, fetchUser, sendConnectionRequest, disconnectConnection } from "../api";
import { useAuth } from "../context/AuthContext";

function Explore() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth(); // ✅ use loading
  const skillFromCategory = location.state?.selectedSkill || "";

  const [teachers, setTeachers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [levels] = useState(["Beginner", "Intermediate", "Advanced"]);
  const [selectedSkills, setSelectedSkills] = useState(skillFromCategory ? [skillFromCategory] : []);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionStatuses, setConnectionStatuses] = useState({}); // { userId: "none" | "pending" | "connected" }
  const [userConnections, setUserConnections] = useState([]); // User's connected users
  const [actionLoading, setActionLoading] = useState({}); // { userId: true }

  const getImageUrl = (idFile) => {
    if (!idFile) return "https://via.placeholder.com/300";
    if (idFile.startsWith("http")) return idFile;
    return `http://localhost:5001/uploads/${idFile}`;
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get(`/teachers`);
      const list = Array.isArray(res.data) ? res.data : [];

      // filter out logged-in user (match by email to avoid id domain mismatch)
      const filtered = user?.email
        ? list.filter((t) => t.email !== user.email)
        : list;

      setTeachers(filtered);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setTeachers([]);
    }
  };

  const fetchConnectionStatuses = async () => {
    if (!user?.id || teachers.length === 0) return;

    try {
      const userData = await fetchUser(user.id);
      const connections = (userData.data.connections || []).map(
        (c) => c._id?.toString?.() || c.toString()
      );
      const sentRequests = (userData.data.sentRequests || []).map(
        (r) => r._id?.toString?.() || r.toString()
      );
      const receivedRequests = (userData.data.requestsReceived || []).map(
        (r) => r._id?.toString?.() || r.toString()
      );

      setUserConnections(connections);

      // Build connection status map for each teacher
      const statusMap = {};
      teachers.forEach((teacher) => {
        const teacherId = teacher._id.toString();
        if (connections.includes(teacherId)) {
          statusMap[teacherId] = "connected";
        } else if (sentRequests.includes(teacherId)) {
          statusMap[teacherId] = "pending";
        } else if (receivedRequests.includes(teacherId)) {
          statusMap[teacherId] = "received";
        } else {
          statusMap[teacherId] = "none";
        }
      });

      setConnectionStatuses(statusMap);
    } catch (error) {
      console.error("Error fetching connection statuses:", error);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await api.get(`/skills`);
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
    if (teachers.length > 0 && user?.id) {
      fetchConnectionStatuses();
    }
  }, [teachers, user?.id]);

  useEffect(() => {
    if (skillFromCategory) setSelectedSkills([skillFromCategory]);
  }, [skillFromCategory]);

  const filteredTeachers = Array.isArray(teachers)
    ? teachers.filter((teacher) => {
        const matchesSearch = searchQuery === "" ||
          teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.categories?.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesSkills = selectedSkills.length === 0 ||
          selectedSkills.some(skill =>
            teacher.categories?.includes(skill) || teacher.skill === skill
          );

        const matchesLevels = selectedLevels.length === 0 ||
          selectedLevels.includes(teacher.level);

        return matchesSearch && matchesSkills && matchesLevels;
      })
    : [];

  const clearAllFilters = () => {
    setSelectedSkills([]);
    setSelectedLevels([]);
    setSearchQuery("");
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const toggleLevel = (level) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  // ✅ Updated handleConnect
  const handleConnect = async (targetUserId) => {
    if (!user) {
      alert("Please log in to send connection requests.");
      navigate("/login");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      await sendConnectionRequest(user.id, targetUserId);
      setConnectionStatuses((prev) => ({ ...prev, [targetUserId]: "pending" }));
    } catch (err) {
      console.error("Error sending request:", err);
      alert(err.response?.data?.message || "Error sending request");
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleDisconnect = async (targetUserId) => {
    if (!user || !user.id) return;

    setActionLoading((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      await disconnectConnection(user.id, targetUserId);
      setConnectionStatuses((prev) => ({ ...prev, [targetUserId]: "none" }));
      setUserConnections((prev) => prev.filter((id) => id !== targetUserId));
      alert("Disconnected successfully");
    } catch (err) {
      console.error("Error disconnecting:", err);
      alert(err.response?.data?.message || "Error disconnecting");
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetUserId]: false }));
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
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          🔍 Find Teachers
        </h2>

        {/* Search Bar */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-700 flex items-center">
            <span className="mr-2">🔎</span>
            Search
          </h3>
          <input
            type="text"
            placeholder="Search by name, bio, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-700 flex items-center">
            <span className="mr-2">🎯</span>
            Skills (Multi-select)
          </h3>
          <div className="max-h-40 overflow-y-auto">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <label
                  key={skill}
                  className={`flex items-center mb-2 cursor-pointer p-2 rounded-lg transition-colors ${
                    selectedSkills.includes(skill)
                      ? "bg-green-100 text-green-700 font-semibold"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={skill}
                    onChange={() => toggleSkill(skill)}
                    checked={selectedSkills.includes(skill)}
                    className="mr-3 text-green-500"
                  />
                  <span className="text-sm">{skill}</span>
                </label>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No skills available</p>
            )}
          </div>
        </div>

        {/* Levels */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-700 flex items-center">
            <span className="mr-2">📊</span>
            Experience Level (Multi-select)
          </h3>
          {levels.map((level) => (
            <label
              key={level}
              className={`flex items-center mb-2 cursor-pointer p-2 rounded-lg transition-colors ${
                selectedLevels.includes(level)
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                value={level}
                onChange={() => toggleLevel(level)}
                checked={selectedLevels.includes(level)}
                className="mr-3 text-blue-500"
              />
              <span className="text-sm">{level}</span>
            </label>
          ))}
        </div>

        {/* Results count */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{filteredTeachers.length}</span>{" "}
            teachers found
          </p>
        </div>

        <button
          onClick={clearAllFilters}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all font-medium"
        >
          🗑️ Clear All Filters
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
                {connectionStatuses[teacher._id] === "connected" ? (
                  <>
                    <button
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      onClick={() => navigate(`/chat/${teacher._id}`)}
                      disabled={actionLoading[teacher._id]}
                    >
                      {actionLoading[teacher._id] ? "Loading..." : "💬 Chat"}
                    </button>
                    <button
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      onClick={() => handleDisconnect(teacher._id)}
                      disabled={actionLoading[teacher._id]}
                    >
                      {actionLoading[teacher._id] ? "Loading..." : "🚫 Disconnect"}
                    </button>
                  </>
                ) : connectionStatuses[teacher._id] === "pending" ? (
                  <button
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 rounded-lg cursor-not-allowed shadow-md"
                    disabled
                  >
                    ⏳ Pending
                  </button>
                ) : (
                  <button
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    onClick={() => handleConnect(teacher._id)}
                    disabled={actionLoading[teacher._id]}
                  >
                    {actionLoading[teacher._id] ? "Sending..." : "🤝 Connect"}
                  </button>
                )}

                <button
                  onClick={() =>
                    navigate(`/teacher/${teacher._id}`, { state: teacher })
                  }
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  👤 View Profile
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
