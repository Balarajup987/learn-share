import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  api,
  fetchUser,
  sendConnectionRequest,
  disconnectConnection,
} from "../api";
import { useAuth } from "../context/AuthContext";
import ReportUserModal from "../components/ReportUserModal";

function Explore() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth(); // ✅ use loading
  const skillFromCategory = location.state?.selectedSkill || "";
  const searchFromUrl = searchParams.get('search') || "";

  const [teachers, setTeachers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [levels] = useState(["Beginner", "Intermediate", "Advanced"]);
  const [selectedSkills, setSelectedSkills] = useState(
    skillFromCategory ? [skillFromCategory] : []
  );
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionStatuses, setConnectionStatuses] = useState({}); // { userId: "none" | "pending" | "connected" }
  const [userConnections, setUserConnections] = useState([]); // User's connected users
  const [actionLoading, setActionLoading] = useState({}); // { userId: true }
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

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

  useEffect(() => {
    if (searchFromUrl) setSearchQuery(searchFromUrl);
  }, [searchFromUrl]);

  const filteredTeachers = Array.isArray(teachers)
    ? teachers.filter((teacher) => {
        const matchesSearch =
          searchQuery === "" ||
          teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.categories?.some((cat) =>
            cat.toLowerCase().includes(searchQuery.toLowerCase())
          );

        const matchesSkills =
          selectedSkills.length === 0 ||
          selectedSkills.some(
            (skill) =>
              teacher.categories?.includes(skill) || teacher.skill === skill
          );

        const matchesLevels =
          selectedLevels.length === 0 || selectedLevels.includes(teacher.level);

        return matchesSearch && matchesSkills && matchesLevels;
      })
    : [];

  const clearAllFilters = () => {
    setSelectedSkills([]);
    setSelectedLevels([]);
    setSearchQuery("");
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleLevel = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
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
      <aside className="w-full md:w-1/4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-xl p-6 mb-6 md:mb-0 border border-indigo-100">
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🎯 Discover Skills
          </h2>
          <p className="text-gray-600 text-sm">Find your perfect mentor</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
            />
            <div className="absolute left-3 top-3.5 text-indigo-400">
              🔍
            </div>
          </div>
        </div>

        {/* Skill Categories */}
        <div className="mb-6">
          <h3 className="font-bold mb-4 text-gray-800 flex items-center text-lg">
            <span className="mr-2 text-2xl">🚀</span>
            Skill Categories
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <label
                  key={skill}
                  className={`flex items-center cursor-pointer p-3 rounded-xl transition-all duration-200 group ${
                    selectedSkills.includes(skill)
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105"
                      : "hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-md border border-indigo-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={skill}
                    onChange={() => toggleSkill(skill)}
                    checked={selectedSkills.includes(skill)}
                    className="mr-3 w-4 h-4 text-indigo-600 bg-white border-2 border-indigo-300 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <span className={`text-sm font-medium ${
                    selectedSkills.includes(skill) ? 'text-white' : 'text-gray-700 group-hover:text-indigo-700'
                  }`}>
                    {skill}
                  </span>
                </label>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">Loading skills...</p>
            )}
          </div>
        </div>

        {/* Experience Levels */}
        <div className="mb-6">
          <h3 className="font-bold mb-4 text-gray-800 flex items-center text-lg">
            <span className="mr-2 text-2xl">⭐</span>
            Experience Level
          </h3>
          <div className="space-y-2">
            {levels.map((level) => (
              <label
                key={level}
                className={`flex items-center cursor-pointer p-3 rounded-xl transition-all duration-200 group ${
                  selectedLevels.includes(level)
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105"
                    : "hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:shadow-md border border-green-100"
                }`}
              >
                <input
                  type="checkbox"
                  value={level}
                  onChange={() => toggleLevel(level)}
                  checked={selectedLevels.includes(level)}
                  className="mr-3 w-4 h-4 text-green-600 bg-white border-2 border-green-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className={`text-sm font-medium ${
                  selectedLevels.includes(level) ? 'text-white' : 'text-gray-700 group-hover:text-green-700'
                }`}>
                  {level}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Results & Actions */}
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl border border-indigo-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-700">Teachers Found</span>
              <span className="text-2xl font-bold text-indigo-600">{filteredTeachers.length}</span>
            </div>
          </div>

          <button
            onClick={clearAllFilters}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🗑️ Clear Filters
          </button>
        </div>
      </aside>

      {/* Teacher Cards */}
      <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ml-0 md:ml-6">
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <div
              key={teacher._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-6 relative overflow-hidden group border border-gray-100"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                <div className="relative mb-4">
                  <img
                    src={getImageUrl(teacher.idFile)}
                    alt={teacher.name}
                    className="w-full h-48 object-cover rounded-xl shadow-md"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <div className="flex items-center text-yellow-500">
                      <span className="text-sm font-bold mr-1">
                        {teacher.rating || 0}
                      </span>
                      ⭐
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{teacher.name}</h3>
                    <p className="text-indigo-600 font-medium text-sm">
                      {teacher.skill || teacher.categories?.join(", ")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
                      {teacher.level}
                    </span>
                    <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200">
                      {teacher.experience}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {teacher.bio || teacher.description}
                  </p>

                  {/* View Profile button */}
                  <button
                    onClick={() =>
                      navigate(`/teacher/${teacher._id}`, {
                        state: {
                          teacher,
                          connectionStatus: connectionStatuses[teacher._id],
                        },
                      })
                    }
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm"
                  >
                    👤 View Profile
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No teachers found</h3>
            <p className="text-gray-500 text-center">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportUserModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedTeacher(null);
        }}
        reportedUser={selectedTeacher}
        onSuccess={() => {
          setShowReportModal(false);
          setSelectedTeacher(null);
          alert("Report submitted successfully! Admin will review it.");
        }}
      />
    </div>
  );
}

export default Explore;
