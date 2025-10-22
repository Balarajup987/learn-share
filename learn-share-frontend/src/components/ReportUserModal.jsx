import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ReportUserModal = ({ isOpen, onClose, reportedUser, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "inappropriate_behavior",
    complainantEmail: user?.email || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        subject: "",
        description: "",
        category: "inappropriate_behavior",
        complainantEmail: user?.email || "",
      });
      setMessage("");
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5001/api/complaints/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            complainantId: user?.id,
            reportedUserId: reportedUser._id,
            complainantEmail: formData.complainantEmail,
            subject: formData.subject,
            description: formData.description,
            category: formData.category,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          "Complaint submitted successfully! Admin will review it shortly."
        );
        onSuccess?.();
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(data.message || "Error submitting complaint");
      }
    } catch (error) {
      setMessage("Error submitting complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">🚨 Report User</h2>
              <p className="text-red-100 mt-1">
                Report {reportedUser?.name} for inappropriate behavior
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief description of the issue"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
                maxLength={100}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="harassment">Harassment</option>
                <option value="inappropriate_behavior">
                  Inappropriate Behavior
                </option>
                <option value="spam">Spam</option>
                <option value="fake_profile">Fake Profile</option>
                <option value="scam">Scam/Fraud</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Detailed Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please provide detailed information about the incident..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={5}
                required
                maxLength={1000}
              />
              <p className="text-gray-500 text-sm mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Your Email *
              </label>
              <input
                type="email"
                name="complainantEmail"
                value={formData.complainantEmail}
                onChange={handleChange}
                placeholder="your-email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
              <p className="text-gray-500 text-sm mt-1">
                Admin may contact you for additional information
              </p>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.includes("successfully")
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors font-medium"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>

          {/* Warning */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="text-yellow-600 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">
                  Important Notice
                </h3>
                <p className="text-yellow-700 text-sm">
                  False reports may result in account restrictions. Please
                  ensure your complaint is accurate and made in good faith.
                  Admin will review all reports and take appropriate action.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportUserModal;
