import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5001/api/connection/received-by-user/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setRequests([]);
    }
  };

  const handleAccept = async (fromId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5001/api/connection/accept-by-user`,
        { userId: user.id, fromId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (fromId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5001/api/connection/reject-by-user`,
        { userId: user.id, fromId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchRequests();
    } catch (err) {
      console.error(err);
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
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleAccept(r._id)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(r._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Requests;
