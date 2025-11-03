import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

const API_URL =
  import.meta.env.VITE_API_URL || "https://proccms-backend.onrender.com";

const AdminManualCompletion = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // ✅ Fetch all repair requests (admin gets all)
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/repair-requests`, {
        params: { role: "admin" },
      });

      // Show only requests not marked Completed or not verified
      const filtered = res.data.filter(
        (r) => r.status !== "Completed" || !r.isVerified
      );

      setRequests(filtered);
    } catch (err) {
      console.error("Failed to load requests:", err);
      toast.error("Failed to load repair requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // ✅ Handle manual completion / verification
  const handleManualUpdate = async (id, action) => {
    try {
      setUpdatingId(id);
      await axios.patch(
        `${API_URL}/api/repair-requests/admin/manual-update/${id}`,
        { action }
      );
      toast.success(
        `Request manually ${
          action === "complete" ? "completed" : "verified"
        } ✅`
      );
      fetchPendingRequests();
    } catch (err) {
      console.error("Manual update failed:", err);
      toast.error("Update failed: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container mt-5 p-5">
      <h4 className="mb-3 fw-bold text-primary">
        Admin Manual Completion / Verification
      </h4>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2 text-muted">Loading requests...</div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center text-muted mt-5">
          No pending or unverified requests found ✅
        </div>
      ) : (
        <Table
          striped
          bordered
          hover
          responsive
          className="shadow-sm align-middle"
        >
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Requested By</th>
              <th>Department</th>
              <th>Description</th>
              <th>Status</th>
              <th>Verified</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, idx) => (
              <tr key={req._id}>
                <td>{idx + 1}</td>
                <td className="fw-semibold">{req.username}</td>
                <td>{req.department}</td>
                <td style={{ maxWidth: "250px" }}>{req.description}</td>

                {/* ✅ Status Badge */}
                <td>
                  <span
                    className="badge px-2 py-1"
                    style={{
                      backgroundColor:
                        req.status === "Completed"
                          ? "rgba(74, 161, 15, 1)" // 🟢 Green
                          : req.status === "Pending"
                          ? "#dc3545" // 🔴 Red
                          : req.status === "Assigned"
                          ? "#ffeb3bff" // 🟡 Yellow
                          : "#6c757d", // Gray
                      color:
                        req.status === "Assigned" || req.status === "Pending"
                          ? "#111"
                          : "#fff",
                      fontWeight: "800",
                      fontSize: "0.7rem",
                      border: "1px solid rgba(0,0,0,0.2)", // ✅ Thin border
                      borderRadius: "6px",
                    }}
                  >
                    {req.status}
                  </span>
                </td>

                {/* ✅ Verification Badge */}
                <td>
                  {req.isVerified ? (
                    <span
                      className="badge px-1 py-1"
                      style={{
                        backgroundColor: "#6add0bff",
                        color: "#000",
                        fontWeight: "800",
                        fontSize: "0.85rem",
                        border: "1px solid rgba(0,0,0,0.2)",
                        borderRadius: "6px",
                      }}
                    >
                      Verified
                    </span>
                  ) : (
                    <span
                      className="badge px-2 py-1"
                      style={{
                        backgroundColor: "#e46a18ff", // 🟠 Orange
                        color: "#000",
                        fontWeight: "700",
                        fontSize: "0.80rem",
                        border: "1px solid rgba(0,0,0,0.2)",
                        borderRadius: "6px",
                      }}
                    >
                      Not Verified
                    </span>
                  )}
                </td>

                {/* ✅ Action Buttons */}
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    {/* Disable if already completed */}
                    <Button
                      size="sm"
                      variant="success"
                      disabled={
                        updatingId === req._id || req.status === "Completed"
                      }
                      onClick={() =>
                        handleManualUpdate(req._id, "complete")
                      }
                    >
                      {updatingId === req._id ? (
                        <Spinner
                          animation="border"
                          size="sm"
                          variant="light"
                        />
                      ) : req.status === "Completed" ? (
                        "Completed"
                      ) : (
                        "Mark Completed"
                      )}
                    </Button>

                    {/* Disable if already verified */}
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={
                        updatingId === req._id || req.isVerified === true
                      }
                      onClick={() => handleManualUpdate(req._id, "verify")}
                    >
                      {updatingId === req._id ? (
                        <Spinner
                          animation="border"
                          size="sm"
                          variant="light"
                        />
                      ) : req.isVerified ? (
                        "Verified"
                      ) : (
                        "Mark Verified"
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default AdminManualCompletion;
