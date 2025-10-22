import React, { useState } from "react";
import { signupUser } from "../api"; // make sure path is correct
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      const res = await signupUser({ name, email, password });
      setMessage(res.data.message || "User created successfully!");
      // redirect to login after 1 sec
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f')",
      }}
    >
      <div className="bg-white/20 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full border border-white/30">
        <h2 className="text-4xl font-bold text-white text-center mb-8 drop-shadow-lg">
          Sign Up
        </h2>
        <form className="space-y-6" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400 border border-gray-300 shadow-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400 border border-gray-300 shadow-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400 border border-gray-300 shadow-lg"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400 border border-gray-300 shadow-lg"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Sign Up
          </button>
        </form>
        {message && (
          <p
            className="text-white mt-4 text-center font-medium drop-shadow-lg"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
          >
            {message}
          </p>
        )}
        <p
          className="text-white mt-6 text-center drop-shadow-lg"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
        >
          Already have an account?{" "}
          <a
            href="/login"
            className="text-green-300 hover:underline font-semibold"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
