import React, { useEffect, useState } from "react";
import { fetchReceivedRequests, acceptConnectionRequest, rejectConnectionRequest } from "../api";
import { useAuth } from "../context/AuthContext";

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState({});

  const fetchRequests = async () => {
    try {
      const res = await fetchReceivedRequests(user.id);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setRequests([]);
    }
  };

  const handleAccept = async (fromId) => {
    setLoading((prev) => ({ ...prev, [fromId]: true }));
    try {
      await acceptConnectionRequest(user.id, fromId);
      fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, [fromId]: false }));
    }
  };

  const handleReject = async (fromId) => {
    setLoading((prev) => ({ ...prev, [fromId]: true }));
    try {
      await rejectConnectionRequest(user.id, fromId);
      fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, [fromId]: false }));
    }
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Requests Received</h1>
      {requests.length === 0 ? (
        <p>No new requests.</p>
      ) : (
        requests.map((r) => (
          <div key={r._id} className="border p-3 mb-2 rounded-lg">
            <h2 className="text-lg font-semibold">{r.name}</h2>
            <p>{r.email}</p>
            <p className="text-sm text-gray-600 capitalize">Role: {r.role}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleAccept(r._id)}
                className="bg-green-500 text-white px-3 py-1 rounded"
                disabled={loading[r._id]}
              >
                {loading[r._id] ? "Accepting..." : "Accept"}
              </button>
              <button
                onClick={() => handleReject(r._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
                disabled={loading[r._id]}
              >
                {loading[r._id] ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Requests;
