import React, { useState } from "react";
import { loginUser } from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "http://localhost:5001/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail }),
        }
      );
      const data = await res.json();
      setResetMessage(data.message || "Password reset email sent!");

      if (data.success) {
        setShowOTPForm(true);
      }
    } catch (err) {
      setResetMessage("Error sending reset email");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setResetMessage("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5001/api/auth/reset-password-with-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: resetEmail,
            otp,
            newPassword,
          }),
        }
      );
      const data = await res.json();
      setResetMessage(data.message || "Password reset successful!");

      if (data.success) {
        setTimeout(() => {
          setShowForgotPassword(false);
          setShowOTPForm(false);
          setResetEmail("");
          setOtp("");
          setNewPassword("");
          setConfirmNewPassword("");
          setResetMessage("");
        }, 2000);
      }
    } catch (err) {
      setResetMessage("Error resetting password");
    }
  };

  const handleResendOTP = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      setResetMessage(data.message || "OTP resent successfully!");
    } catch (err) {
      setResetMessage("Error resending OTP");
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
            <label
              className="absolute left-4 top-3 text-gray-200 text-sm transition-all duration-300
              peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
              peer-focus:top-[-8px] peer-focus:text-white peer-focus:text-sm"
            >
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
            <label
              className="absolute left-4 top-3 text-gray-200 text-sm transition-all duration-300
              peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
              peer-focus:top-[-8px] peer-focus:text-white peer-focus:text-sm"
            >
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

        {/* Forgot Password Link */}
        <p className="text-gray-200 mt-6 text-center">
          <button
            onClick={() => setShowForgotPassword(!showForgotPassword)}
            className="text-blue-300 hover:underline font-semibold"
          >
            Forgot Password?
          </button>
        </p>

        {/* Forgot Password Form */}
        {showForgotPassword && !showOTPForm && (
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-lg rounded-2xl">
            <h3 className="text-white text-lg font-semibold mb-4 text-center">
              Reset Password
            </h3>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300"
              >
                Send OTP to Email
              </button>
            </form>
            {resetMessage && (
              <p className="text-white mt-4 text-center font-medium text-sm">
                {resetMessage}
              </p>
            )}
          </div>
        )}

        {/* OTP Verification Form */}
        {showOTPForm && (
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-lg rounded-2xl">
            <h3 className="text-white text-lg font-semibold mb-4 text-center">
              Enter OTP & New Password
            </h3>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-2xl tracking-widest"
                  maxLength="6"
                  required
                />
              </div>

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />

              <button
                type="submit"
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all duration-300"
              >
                Reset Password
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                className="w-full py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300 text-sm"
              >
                Resend OTP
              </button>
            </form>

            {resetMessage && (
              <p
                className={`mt-4 text-center font-medium text-sm ${
                  resetMessage.includes("successful")
                    ? "text-green-300"
                    : resetMessage.includes("Error") ||
                      resetMessage.includes("Invalid")
                    ? "text-red-300"
                    : "text-white"
                }`}
              >
                {resetMessage}
              </p>
            )}
          </div>
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
