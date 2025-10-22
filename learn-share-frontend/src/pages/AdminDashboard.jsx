import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, resolved, under_review
  const [priority, setPriority] = useState("all"); // all, low, medium, high, urgent

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-3xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/complaints/all");
      const data = await response.json();

      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Handle complaint action
  const handleComplaintAction = async (complaintId, action, adminNotes) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `http://localhost:5001/api/complaints/${complaintId}/action`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            adminNotes,
            adminId: user.id,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchComplaints(); // Refresh complaints
        setSelectedComplaint(null);
      } else {
        alert(data.message || "Error taking action");
      }
    } catch (error) {
      console.error("Error taking action:", error);
      alert("Error taking action");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((complaint) => {
    const statusMatch = filter === "all" || complaint.status === filter;
    const priorityMatch = priority === "all" || complaint.priority === priority;
    return statusMatch && priorityMatch;
  });

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "dismissed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🛡️ Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Manage user complaints and platform safety
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Complaints
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {complaints.filter((c) => c.status === "pending").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  High Priority
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {
                    complaints.filter(
                      (c) => c.priority === "high" || c.priority === "urgent"
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">🚨</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Under Review
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {complaints.filter((c) => c.status === "under_review").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">🔍</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-gray-900">
                  {complaints.filter((c) => c.status === "resolved").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Filter
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
      </div>

        {/* Complaints List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              User Complaints ({filteredComplaints.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint._id}
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedComplaint(complaint)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {complaint.subject}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          complaint.status
                        )}`}
                      >
                        {complaint.status.replace("_", " ")}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(
                          complaint.priority
                        )}`}
                      >
                        {complaint.priority}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-2 line-clamp-2">
                      {complaint.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        <strong>Complainant:</strong>{" "}
                        {complaint.complainant?.name}
                      </span>
                      <span>
                        <strong>Reported:</strong>{" "}
                        {complaint.reportedUser?.name}
                      </span>
                      <span>
                        <strong>Category:</strong>{" "}
                        {complaint.category.replace("_", " ")}
                      </span>
                      <span>
                        <strong>Date:</strong>{" "}
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">
                      ID: {complaint._id.slice(-8)}
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      View Details →
                      </button>
                  </div>
                </div>
              </div>
                ))}
          </div>

          {filteredComplaints.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📋</span>
              </div>
              <p className="text-gray-500 text-lg">No complaints found</p>
            </div>
          )}
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onAction={handleComplaintAction}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

// Complaint Detail Modal Component
const ComplaintDetailModal = ({
  complaint,
  onClose,
  onAction,
  actionLoading,
}) => {
  const [adminNotes, setAdminNotes] = useState(complaint.adminNotes || "");
  const [selectedAction, setSelectedAction] = useState("");

  const handleSubmitAction = async () => {
    if (!selectedAction) {
      alert("Please select an action");
      return;
    }

    await onAction(complaint._id, selectedAction, adminNotes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Complaint Details</h2>
              <p className="text-red-100 mt-1">ID: {complaint._id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Complaint Info */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Complaint Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Subject:</strong> {complaint.subject}
                  </div>
                  <div>
                    <strong>Category:</strong>{" "}
                    {complaint.category.replace("_", " ")}
                  </div>
                  <div>
                    <strong>Priority:</strong> {complaint.priority}
                  </div>
                  <div>
                    <strong>Status:</strong>{" "}
                    {complaint.status.replace("_", " ")}
                  </div>
                <div>
                    <strong>Date:</strong>{" "}
                    {new Date(complaint.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-sm text-gray-700">{complaint.description}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Users Involved
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="border-b pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <strong>Complainant:</strong>
                      <span className={`px-2 py-1 rounded text-xs ${
                        complaint.complainant?.status === 'active' ? 'bg-green-100 text-green-800' :
                        complaint.complainant?.status === 'blocked' ? 'bg-red-100 text-red-800' :
                        complaint.complainant?.status === 'restricted' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {complaint.complainant?.status || 'active'}
                      </span>
                    </div>
                    <div>{complaint.complainant?.name}</div>
                    <div className="text-gray-500">{complaint.complainant?.email}</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-red-600">Reported User:</strong>
                      <span className={`px-2 py-1 rounded text-xs ${
                        complaint.reportedUser?.status === 'active' ? 'bg-green-100 text-green-800' :
                        complaint.reportedUser?.status === 'blocked' ? 'bg-red-100 text-red-800' :
                        complaint.reportedUser?.status === 'restricted' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {complaint.reportedUser?.status || 'active'}
                      </span>
                    </div>
                    <div>{complaint.reportedUser?.name}</div>
                    <div className="text-gray-500">{complaint.reportedUser?.email}</div>
                    {complaint.reportedUser?.warningCount > 0 && (
                      <div className="mt-2 text-orange-600">
                        ⚠️ Warnings: {complaint.reportedUser?.warningCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Admin Actions */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Admin Notes
                </h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Add admin notes..."
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Take Action
                </h3>
                <div className="space-y-3">
                <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Action</option>
                    <option value="warning">Issue Warning</option>
                    <option value="restrict">Restrict User</option>
                    <option value="block">Block User</option>
                    <option value="suspend">Suspend User</option>
                    <option value="dismiss">Dismiss Complaint</option>
                </select>

                  <button
                    onClick={handleSubmitAction}
                    disabled={actionLoading || !selectedAction}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    {actionLoading ? "Processing..." : "Execute Action"}
                  </button>
                </div>
              </div>

              {complaint.adminNotes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Previous Notes
                  </h3>
                  <p className="text-sm text-gray-700">
                    {complaint.adminNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
