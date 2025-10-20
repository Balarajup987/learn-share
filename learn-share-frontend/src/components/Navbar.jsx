import { useState, useRef, useEffect } from "react";
import { FaBars, FaTimes, FaSun, FaMoon } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isLoggedIn, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className={`bg-white shadow-md fixed w-full top-0 left-0 z-50 ${isDarkMode ? 'dark:bg-gray-800 dark:text-white' : ''}`}>
      <div className="container mx-auto flex justify-between items-center px-4 py-5">
        {/* Logo */}
        <Link to="/" className="text-3xl font-bold text-green-600 dark:text-green-400">
          LearnShare
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-lg">
          <Link to="/explore">Explore</Link>
          <li>
            <input
              type="text"
              placeholder="Search..."
              className={`border rounded-full px-5 py-2 outline-none focus:ring-2 focus:ring-green-500 text-base ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
            />
          </li>
          <li>
            <Link to="/teach" className="hover:text-green-500 dark:hover:text-green-400">
              Teach With Us
            </Link>
          </li>
          <li>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-600" />}
            </button>
          </li>

          {!isLoggedIn ? (
            <li>
              <Link
                to="/login"
                className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 text-lg"
              >
                Login
              </Link>
            </li>
          ) : (
            <li className="relative" ref={dropdownRef}>
              <button
                className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg hover:bg-green-600 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {firstLetter}
              </button>

              {isDropdownOpen && (
                <ul className={`absolute right-0 mt-2 shadow-lg rounded-lg border py-2 min-w-[200px] z-50 ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600' : 'bg-white border-gray-200'}`}>
                  <li className={`px-5 py-3 transition-colors ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  {user?.role === "admin" && (
                    <li className={`px-5 py-3 transition-colors ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                      <Link
                        to="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    </li>
                  )}
                  <li className={`px-5 py-3 transition-colors ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                    <Link
                      to="/profile-update"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Update Profile
                    </Link>
                  </li>
                  <li className={`px-5 py-3 transition-colors ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                    <Link
                      to="/complaints"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Complaints
                    </Link>
                  </li>
                  <li className="px-5 py-3 hover:bg-gray-100 transition-colors">
                    <Link
                      to="/my-courses"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Courses
                    </Link>
                  </li>
                  <li className="px-5 py-3 hover:bg-gray-100 transition-colors">
                    <Link
                      to="/connections"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Connections
                    </Link>
                  </li>
                  <li className={`px-5 py-3 transition-colors ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                    <Link
                      to="/requests"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Requests Received
                    </Link>
                  </li>
                  {user?.teachingCourses?.length > 0 && (
                    <li className="px-5 py-3 hover:bg-gray-100 transition-colors">
                      <Link
                        to="/courses-teaching"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Courses I'm Teaching
                      </Link>
                    </li>
                  )}
                  <li className={`border-t mt-2 pt-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <button
                      className={`px-5 py-3 cursor-pointer w-full text-left transition-colors ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={`md:hidden shadow-lg px-6 py-8 text-lg ${isDarkMode ? 'dark:bg-gray-800 dark:text-white' : 'bg-white'}`}>
          <ul className="flex flex-col gap-6">
            <li>
              <Link to="/explore">Explore</Link>
            </li>
            <li>
              <input
                type="text"
                placeholder="Search..."
                className={`border rounded-full px-5 py-2 w-full outline-none focus:ring-2 focus:ring-green-500 text-base ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
              />
            </li>
            <li>
              <Link to="/teach" className="hover:text-green-500 dark:hover:text-green-400">
                Teach With Us
              </Link>
            </li>
            <li>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-600" />}
              </button>
            </li>
            {!isLoggedIn ? (
              <li>
                <Link
                  to="/login"
                  className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600"
                >
                  Login
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                {user?.role === "admin" && (
                  <li>
                    <Link to="/admin">Admin Panel</Link>
                  </li>
                )}
                <li>
                  <Link to="/profile-update">Update Profile</Link>
                </li>
                <li>
                  <Link to="/complaints">My Complaints</Link>
                </li>
                <li>
                  <Link to="/my-courses">My Courses</Link>
                </li>
                <li>
                  <Link to="/connections">Connections</Link>
                </li>
                <li>
                  <Link to="/requests">Requests Received</Link>
                </li>
                <li onClick={logout} className="cursor-pointer">
                  Logout
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
