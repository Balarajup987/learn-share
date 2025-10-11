import React, { useState } from "react";
import { signupUser } from "../api"; // make sure path is correct

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
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
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full">
        <h2 className="text-4xl font-bold text-white text-center mb-8">
          Sign Up
        </h2>
        <form className="space-y-6" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all duration-300"
          >
            Sign Up
          </button>
        </form>
        {message && (
          <p className="text-white mt-4 text-center font-medium">{message}</p>
        )}
        <p className="text-gray-200 mt-6 text-center">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-green-300 hover:underline font-semibold"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
