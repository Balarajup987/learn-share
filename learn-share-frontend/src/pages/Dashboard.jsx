import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { API_BASE, loginUser, signupUser, fetchTeachers, fetchSkills, fetchUser } from "../api";

const Dashboard = () => {
  const { user, isLoggedIn, switchRole } = useAuth();
  const [stats, setStats] = useState({
    connections: 0,
    pendingRequests: 0,
    sentRequests: 0,
    totalMessages: 0,
  });
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [recentConnections, setRecentConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleSwitching, setRoleSwitching] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchDashboardData();
    }
  }, [isLoggedIn, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user stats using new API
      const userData = await fetchUser(user.id);

      // Fetch connected users details
      const connections = userData.data.connections || [];
      const connectionDetails = await Promise.all(
        connections.map(async (connectionId) => {
          try {
            const connectionResponse = await fetchUser(connectionId);
            return connectionResponse.data;
          } catch (error) {
            return null;
          }
        })
      );

      setRecentConnections(connectionDetails.filter(Boolean).slice(0, 3));

      setStats({
        connections: connections.length,
        pendingRequests: userData.data.sentRequests?.length || 0,
        sentRequests: userData.data.sentRequests?.length || 0,
        totalMessages: Math.floor(Math.random() * 50) + 10, // Mock data for now
      });

      // Check if user has a teacher profile (role teacher or both)
      if (userData.data.role === "teacher" || userData.data.role === "both") {
        setTeacherProfile(userData.data);
      } else {
        setTeacherProfile(null);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSwitch = async (newRole) => {
    setRoleSwitching(true);
    try {
      await switchRole(newRole);
      // Refresh dashboard data after role change
      await fetchDashboardData();
      alert(`Role switched to ${newRole} successfully!`);
    } catch (error) {
      console.error("Error switching role:", error);
      alert("Error switching role. Please try again.");
    } finally {
      setRoleSwitching(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-600 text-3xl">🎓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to LearnShare
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to access your personalized dashboard
          </p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Ready to continue your learning journey?
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-sm text-gray-500">Today's Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Connections</p>
                <p className="text-3xl font-bold text-gray-900">{stats.connections}</p>
                <p className="text-xs text-green-600 mt-1">+2 this week</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
                <p className="text-xs text-yellow-600 mt-1">Awaiting response</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMessages}</p>
                <p className="text-xs text-blue-600 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">💬</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Streak</p>
                <p className="text-3xl font-bold text-gray-900">7</p>
                <p className="text-xs text-purple-600 mt-1">Days in a row</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">🔥</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Your Profile</h2>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">
                      {user?.name?.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {user?.name}
                  </h3>
                  <p className="text-gray-600 mb-2">{user?.email}</p>
                  <div className="flex items-center justify-between mb-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Active Member
                    </div>
                    <select
                      value={user?.role || "student"}
                      onChange={(e) => handleRoleSwitch(e.target.value)}
                      disabled={roleSwitching}
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-500 capitalize">Current Role: {user?.role || "student"}</p>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-semibold">2024</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total connections</span>
                    <span className="font-semibold">{stats.connections}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Learning level</span>
                    <span className="font-semibold text-blue-600">Intermediate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Connections & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Connections */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Connections</h2>
              </div>
              <div className="p-6">
                {recentConnections.length > 0 ? (
                  <div className="space-y-4">
                    {recentConnections.map((teacher, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {teacher.name?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{teacher.name}</h3>
                          <p className="text-sm text-gray-600">{teacher.categories?.join(", ")}</p>
                        </div>
                        <Link
                          to={`/chat/${teacher._id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Chat
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-400 text-2xl">👥</span>
                    </div>
                    <p className="text-gray-600 mb-4">No connections yet</p>
                    <Link
                      to="/explore"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Find Teachers
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link
                    to="/explore"
                    className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔍</div>
                      <h3 className="font-semibold text-sm">Explore</h3>
                    </div>
                  </Link>

                  <Link
                    to="/my-courses"
                    className="group bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📚</div>
                      <h3 className="font-semibold text-sm">My Courses</h3>
                    </div>
                  </Link>

                  <Link
                    to="/connections"
                    className="group bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">👥</div>
                      <h3 className="font-semibold text-sm">Connections</h3>
                    </div>
                  </Link>

                  <Link
                    to="/requests"
                    className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📬</div>
                      <h3 className="font-semibold text-sm">Requests</h3>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Profile Section */}
        {teacherProfile && (
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Your Teacher Profile</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {teacherProfile.name?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {teacherProfile.name}
                    </h3>
                    <p className="text-gray-600 mb-2">{teacherProfile.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {teacherProfile.categories?.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {teacherProfile.experience}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Mode</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {teacherProfile.mode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;