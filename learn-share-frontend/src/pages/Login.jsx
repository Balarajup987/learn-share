import React, { useState } from "react";
import { loginUser } from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });

      // 🔥 FIXED: use res instead of response, and correct argument order
      login(res.data.user, res.data.token);

      setMessage(res.data.message || "Login successful!");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Glass Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full animate-fadeIn">
        <h2 className="text-4xl font-bold text-white text-center mb-8">
          Login
        </h2>

        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Email */}
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="peer w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              required
            />
            <label className="absolute left-4 top-3 text-gray-200 text-sm transition-all duration-300
              peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
              peer-focus:top-[-8px] peer-focus:text-white peer-focus:text-sm">
              Email
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="peer w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              required
            />
            <label className="absolute left-4 top-3 text-gray-200 text-sm transition-all duration-300
              peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
              peer-focus:top-[-8px] peer-focus:text-white peer-focus:text-sm">
              Password
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Login
          </button>
        </form>

        {/* Feedback message */}
        {message && (
          <p className="text-white mt-4 text-center font-medium">{message}</p>
        )}

        {/* Signup link */}
        <p className="text-gray-200 mt-6 text-center">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-blue-300 hover:underline font-semibold"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
