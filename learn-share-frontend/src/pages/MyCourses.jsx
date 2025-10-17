import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MyCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connectedTeachers, setConnectedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnectedTeachers = async () => {
      if (!user?.id) return;
      
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5001/api/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const teacherIds = response.data.connectedTeachers || [];
        if (teacherIds.length > 0) {
          const teachersData = await Promise.all(
            teacherIds.map(id => 
              axios.get(`http://localhost:5001/api/teacher/${id}`)
            )
          );
          setConnectedTeachers(teachersData.map(res => res.data));
        }
      } catch (err) {
        console.error("Error fetching connected teachers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConnectedTeachers();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="mt-2 text-gray-600">Your connected teachers and learning journey</p>
        </div>

        {connectedTeachers.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No courses yet</h3>
            <p className="mt-2 text-gray-500">Connect with teachers to start your learning journey</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedTeachers.map((teacher) => (
              <div key={teacher._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={
                        teacher.idFile
                          ? `http://localhost:5001/uploads/${teacher.idFile}`
                          : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
                      }
                      alt={teacher.name}
                      className="w-15 h-15 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                      <p className="text-sm text-gray-500">{teacher.experience}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {teacher.categories?.map((category, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  {teacher.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{teacher.bio}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {teacher.mode}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/chat?teacher=${teacher._id}`)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                      </button>
                      
                      <button
                        onClick={() => navigate(`/teacher/${teacher._id}`)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{connectedTeachers.length}</div>
              <div className="text-sm text-gray-500">Active Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {connectedTeachers.reduce((acc, teacher) => acc + (teacher.categories?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-500">Skills Learning</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {connectedTeachers.filter(t => t.mode === 'Online').length}
              </div>
              <div className="text-sm text-gray-500">Online Sessions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyCourses;
