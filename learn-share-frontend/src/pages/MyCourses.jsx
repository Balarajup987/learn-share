import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { API_BASE, loginUser, signupUser, fetchTeachers, fetchSkills } from "../api";

const MyCourses = () => {
  const { user, isLoggedIn } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedLessons: 0,
    totalLessons: 0,
    learningTime: 0,
  });

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchCourses();
    }
  }, [isLoggedIn, user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch user's connected teachers
      const userResponse = await api.get(`/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = userResponse.data;

      // Fetch teacher details for each connection
      const connectedTeachers = userData.connectedTeachers || [];
      const teacherDetails = await Promise.all(
        connectedTeachers.map(async (teacherId) => {
          try {
            const teacherResponse = await api.get(`/teacher/${teacherId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return teacherResponse.data;
          } catch (error) {
            return null;
          }
        })
      );

      const validCourses = teacherDetails.filter(Boolean).map((teacher, index) => ({
        id: teacher._id,
        name: teacher.name,
        categories: teacher.categories || [],
        experience: teacher.experience,
        mode: teacher.mode,
        bio: teacher.bio,
        progress: Math.floor(Math.random() * 100), // Mock progress
        lessonsCompleted: Math.floor(Math.random() * 10) + 1,
        totalLessons: Math.floor(Math.random() * 15) + 10,
        lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        rating: (Math.random() * 2 + 3).toFixed(1), // Mock rating between 3-5
      }));

      setCourses(validCourses);
      setStats({
        totalCourses: validCourses.length,
        completedLessons: validCourses.reduce((sum, course) => sum + course.lessonsCompleted, 0),
        totalLessons: validCourses.reduce((sum, course) => sum + course.totalLessons, 0),
        learningTime: validCourses.length * 2.5, // Mock learning time
      });
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-3xl">📚</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Your Courses
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to view your enrolled courses
          </p>
          <Link
            to="/login"
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Learning Journey 📚
              </h1>
              <p className="text-gray-600 text-lg">
                Continue your education with expert teachers
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-sm text-gray-500">Learning Progress</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.totalCourses} Active Courses
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
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                <p className="text-xs text-green-600 mt-1">Enrolled</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">📖</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedLessons}</p>
                <p className="text-xs text-blue-600 mt-1">Out of {stats.totalLessons}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Time</p>
                <p className="text-3xl font-bold text-gray-900">{stats.learningTime}h</p>
                <p className="text-xs text-purple-600 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">⏱️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">4.7</p>
                <p className="text-xs text-orange-600 mt-1">Out of 5.0</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 h-32 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {course.name?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      {course.mode}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                      {course.name}
                    </h3>
                    <div className="flex items-center text-yellow-500">
                      <span className="text-sm font-medium mr-1">{course.rating}</span>
                      <span className="text-sm">⭐</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.bio}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.categories.slice(0, 2).map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                      >
                        {category}
                      </span>
                    ))}
                    {course.categories.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{course.categories.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-500">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {course.lessonsCompleted} of {course.totalLessons} lessons
                      </span>
                      <span className="text-xs text-gray-500">
                        {course.experience}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Last accessed: {course.lastAccessed.toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        to={`/chat/${course.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                      >
                        Chat
                      </Link>
                      <Link
                        to={`/teacher/${course.id}`}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-gray-400 text-4xl">📚</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No Courses Yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start your learning journey by connecting with expert teachers and enrolling in their courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/explore"
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Explore Teachers
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

        {/* Learning Tips */}
        {courses.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              💡 Learning Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Set Goals</h3>
                <p className="text-gray-600 text-sm">
                  Define clear learning objectives for each course to stay motivated and track progress.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">⏰</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Consistent Practice</h3>
                <p className="text-gray-600 text-sm">
                  Dedicate regular time to learning. Even 30 minutes daily can make a significant difference.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-2xl">💬</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ask Questions</h3>
                <p className="text-gray-600 text-sm">
                  Don't hesitate to reach out to your teachers. They're here to help you succeed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;