import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth(); // ✅ moved here

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "";

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-4 py-5">
        {/* Logo */}
        <Link to="/" className="text-3xl font-bold text-green-600">
          LearnShare
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-lg">
          <Link to="/explore">Explore</Link>
          <li>
            <input
              type="text"
              placeholder="Search..."
              className="border rounded-full px-5 py-2 outline-none focus:ring-2 focus:ring-green-500 text-base"
            />
          </li>
          <li>
            <Link to="/teach" className="hover:text-green-500">
              Teach With Us
            </Link>
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
            <li className="relative group">
              <button className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg">
                {firstLetter}
              </button>

              <ul className="absolute right-0 mt-2 bg-white shadow-md rounded-lg hidden group-hover:block">
                <li className="px-5 py-3 hover:bg-gray-100">
                  <Link to="/dashboard">Dashboard</Link>
                </li>

                <li className="px-5 py-3 hover:bg-gray-100">
                  <Link to="/my-courses">My Courses</Link>
                </li>

                {user?.teachingCourses?.length > 0 && (
                  <li className="px-5 py-3 hover:bg-gray-100">
                    <Link to="/courses-teaching">Courses I'm Teaching</Link>
                  </li>
                )}
                <Link
                  to="/requests"
                  className="px-3 py-2 text-blue-600 hover:underline"
                >
                  Requests
                </Link>

                <li
                  className="px-5 py-3 hover:bg-gray-100 cursor-pointer"
                  onClick={logout}
                >
                  Logout
                </li>
              </ul>
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
        <div className="md:hidden bg-white shadow-lg px-6 py-8 text-lg">
          <ul className="flex flex-col gap-6">
            <li>
              <Link to="/explore">Explore</Link>
            </li>
            <li>
              <input
                type="text"
                placeholder="Search..."
                className="border rounded-full px-5 py-2 w-full outline-none focus:ring-2 focus:ring-green-500 text-base"
              />
            </li>
            <li>
              <Link to="/teach" className="hover:text-green-500">
                Teach With Us
              </Link>
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
                <li>
                  <Link to="/my-courses">My Courses</Link>
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
