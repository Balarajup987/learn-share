import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Slider from "./components/Slider";
import Categories from "./components/Categories";
import Welcome from "./components/Welcome";
import Footer from "./components/Footer";
import Explore from "./pages/Explore";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Teach from "./pages/Teach";
import TeacherProfile from "./pages/TeacherProfile";
import ChatBox from "./components/ChatBox";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import Requests from "./pages/Requests";
import Dashboard from "./pages/Dashboard";
import MyCourses from "./pages/MyCourses";
import Connections from "./pages/Connections";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Scroll to top on route change */}
        <ScrollToTop />

        {/* Navbar on all pages */}
        <Navbar />

        {/* Add top padding for navbar height */}
        <div className="pt-24">
          <Routes>
            {/* Home Page */}
            <Route
              path="/"
              element={
                <div className="home-container">
                  <Welcome
                    userName="Bunny"
                    profileImage="https://img.stablecog.com/insecure/1920w/aHR0cHM6Ly9iLnN0YWJsZWNvZy5jb20vYzQ5MmYyNDgtMjg3MC00M2VhLWI3MzMtMGY3N2JjYTE1YzUxLmpwZWc.webp"
                  />
                  <div className="mt-6">
                    <Slider />
                  </div>
                  <div className="mt-6">
                    <Categories />
                  </div>
                  <div className="mt-6">
                    <Footer />
                  </div>
                </div>
              }
            />

            {/* Explore Page */}
            <Route path="/explore" element={<Explore />} />

            {/* Protected Pages */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <MyCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/connections"
              element={
                <ProtectedRoute>
                  <Connections />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <Requests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatBox />
                </ProtectedRoute>
              }
            />

            {/* Auth Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Teach Page */}
            <Route path="/teach" element={<Teach />} />

            {/* Teacher Profile */}
            <Route
              path="/teacher/:teacherId"
              element={
                <ProtectedRoute>
                  <TeacherProfile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
