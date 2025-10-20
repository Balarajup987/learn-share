import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { fetchUserConnections, disconnectConnection } from "../api";

const Connections = () => {
  const { user, isLoggedIn } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all, online, offline

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchConnections();
    }
  }, [isLoggedIn, user]);

  const fetchConnections = async () => {
    try {
      setLoading(true);

      // Fetch user connections using the new API
      const response = await fetchUserConnections(user.id);
      const connectionsData = response.data.connections || [];

      // Map connections with additional data
      const populated = connectionsData.map((c) => ({
        ...c,
        type: c.role === "teacher" || c.role === "both" ? "teacher" : "student",
        lastMessage: c.lastMessage || "Say hello!",
        lastMessageTime: new Date(),
        isOnline: Math.random() > 0.3,
      }));

      const allConnections = populated.sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );

      setConnections(allConnections);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConnections = connections.filter((connection) => {
    const matchesSearch =
      connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.categories?.some((cat) =>
        cat.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (filterMode === "online") return matchesSearch && connection.isOnline;
    if (filterMode === "offline") return matchesSearch && !connection.isOnline;
    return matchesSearch;
  });

  const formatLastMessageTime = (date) => {
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-purple-600 text-3xl">👥</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Your Connections
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to view your learning connections
          </p>
          <Link
            to="/login"
            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Your Learning Network 👥
              </h1>
              <p className="text-gray-600 text-lg">
                Connect and learn with teachers and fellow students
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-sm text-gray-500">Active Connections</p>
                <p className="text-lg font-semibold text-gray-900">
                  {connections.filter((c) => c.isOnline).length} Online
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search connections by name or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  filterMode === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({connections.length})
              </button>
              <button
                onClick={() => setFilterMode("online")}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  filterMode === "online"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Online ({connections.filter((c) => c.isOnline).length})
              </button>
              <button
                onClick={() => setFilterMode("offline")}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  filterMode === "offline"
                    ? "bg-gray-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Offline ({connections.filter((c) => !c.isOnline).length})
              </button>
            </div>
          </div>
        </div>

        {/* Connections List */}
        {filteredConnections.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600">
              <h2 className="text-xl font-semibold text-white">
                {filterMode === "all"
                  ? "All Connections"
                  : filterMode === "online"
                  ? "Online Now"
                  : "Recently Active"}
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredConnections.map((connection, index) => (
                <div
                  key={connection._id || index}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                          connection.type === "teacher"
                            ? "bg-gradient-to-r from-green-500 to-blue-500"
                            : "bg-gradient-to-r from-purple-500 to-pink-500"
                        }`}
                      >
                        {connection.name?.charAt(0)}
                      </div>
                      {connection.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Connection Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {connection.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            connection.type === "teacher"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {connection.type === "teacher"
                            ? "Teacher"
                            : "Student"}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {connection.categories?.join(", ") ||
                          "Learning together"}
                      </p>
                      <p className="text-gray-500 text-sm truncate">
                        {connection.lastMessage}
                      </p>
                    </div>

                    {/* Time and Actions */}
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-xs text-gray-500">
                        {formatLastMessageTime(connection.lastMessageTime)}
                      </span>
                      <div className="flex space-x-2">
                        <Link
                          to={`/chat/${connection._id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                        >
                          Chat
                        </Link>
                        {connection.type === "teacher" && (
                          <Link
                            to={`/teacher/${connection._id}`}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                          >
                            Profile
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-gray-400 text-4xl">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm ? "No matching connections" : "No connections yet"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm
                ? "Try adjusting your search terms or filters."
                : "Start building your learning network by connecting with teachers and students."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/explore"
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Find Teachers
              </Link>
              <Link
                to="/dashboard"
                className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {connections.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">👨‍🏫</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Teachers
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {connections.filter((c) => c.type === "teacher").length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-xl">👨‍🎓</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Students
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {connections.filter((c) => c.type === "student").length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Active Chats
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {connections.filter((c) => c.isOnline).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Connections;
