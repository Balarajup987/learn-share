import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function Explore() {
  const navigate = useNavigate();
  const location = useLocation();

  const skillFromCategory = location.state?.selectedSkill || "";

  const [teachers, setTeachers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [levels, setLevels] = useState([
    "Beginner",
    "Intermediate",
    "Advanced",
  ]); // optional if static

  const [selectedSkill, setSelectedSkill] = useState(skillFromCategory);
  const [selectedLevel, setSelectedLevel] = useState("");

  // Fetch teachers from DB
  const fetchTeachers = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/teachers");
      setTeachers(Array.isArray(res.data) ? res.data : []); // ✅ ensure array
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setTeachers([]); // fallback
    }
  };

  // Optional: fetch skills from DB
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
  }, []);

  useEffect(() => {
    if (skillFromCategory) setSelectedSkill(skillFromCategory);
  }, [skillFromCategory]);

  const filteredTeachers = Array.isArray(teachers)
    ? teachers.filter(
        (teacher) =>
          (selectedSkill === "" || teacher.skill === selectedSkill) &&
          (selectedLevel === "" || teacher.level === selectedLevel)
      )
    : [];

  const clearAllFilters = () => {
    setSelectedSkill("");
    setSelectedLevel("");
  };

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
                src={teacher.idFile || "https://via.placeholder.com/150"}
                alt={teacher.name}
                className="w-full h-40 object-cover rounded-lg"
              />

              <h3 className="text-lg font-semibold mt-3">{teacher.name}</h3>
              <p className="text-gray-600 text-sm">{teacher.skill}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  {teacher.level}
                </span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  {teacher.experience}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                {teacher.description}
              </p>
              <div className="mt-3 text-yellow-500">
                {"⭐".repeat(Math.floor(teacher.rating))}
                <span className="text-gray-600 text-sm ml-1">
                  {teacher.rating}
                </span>
              </div>
              <button
                onClick={() =>
                  navigate(`/teacher/${teacher.id}`, { state: teacher })
                }
                className="mt-4 w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition"
              >
                View Profile
              </button>
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
