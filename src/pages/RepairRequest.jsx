import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";

function RepairRequest() {
  const [description, setDescription] = useState("");
  const [isNewRequirement, setIsNewRequirement] = useState(false);
  const [file, setFile] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  // Load email from localStorage
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      setUserEmail(email);
    } else {
      toast.warning("Email not found. Notifications may not work properly.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return alert("Description required.");

    const formData = new FormData();
    formData.append("description", description);
    formData.append("isNewRequirement", isNewRequirement);
    formData.append("username", localStorage.getItem("name"));
    formData.append("role", localStorage.getItem("role"));
    formData.append("department", localStorage.getItem("department"));
    formData.append("email", userEmail);

    if (file) formData.append("file", file);

    try {
      const res = await fetch(
        "https://proccms-backend.onrender.com/api/repair-requests",
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        toast.success("Submitted successfully! Check your email for updates.", {
          position: "top-center",
          autoClose: 2000,
        });
        handleCancel();
      } else {
        const errorData = await res.json();
        toast.error(`Failed: ${errorData.message || "Unknown error"}`, {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (err) {
      toast.error("Error: " + err.message, {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  const handleCancel = () => {
    setDescription("");
    setIsNewRequirement(false);
    setFile(null);
  };

  return (
    <div style={containerStyle}>
      {/* Left side (form) */}
      <div style={leftSideStyle}>
        <form onSubmit={handleSubmit} style={formStyle}>
          <h3>Repair Request (For Project Office Only)</h3>
          <p style={{ fontStyle: "italic", fontSize: "0.9rem" }}>
            For Computer Center issues, contact your IT-SPOC first. If unresolved,
            they will escalate to CC Staff.
          </p>

          {/* Email field */}
          <div style={emailDisplayStyle}>
            <label style={labelStyle}>Your Email:</label>
            <input
              type="text"
              value={userEmail || "Loading..."}
              readOnly
              style={emailFieldStyle}
            />
            <small style={emailNoteStyle}>
              Notifications will be sent to this email.
            </small>
          </div>

          {/* Description */}
          <label style={labelStyle}>
            Description<span style={{ color: "red" }}>*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            style={textareaStyle}
            placeholder="Enter description"
            required
          />

          {/* Checkbox */}
          <div>
            <label style={{ fontWeight: "bold" }}>
              New requirement (Needs management approval)
              <input
                type="checkbox"
                checked={isNewRequirement}
                onChange={(e) => setIsNewRequirement(e.target.checked)}
                style={{ marginLeft: "10px" }}
              />
            </label>
          </div>

          {/* File upload */}
          <label style={{ fontWeight: "bold" }}>File upload</label>
          <div style={fileUploadContainerStyle}>
            <input
              type="file"
              onChange={handleFileChange}
              style={fileInputStyle}
              id="fileUpload"
            />
            <label htmlFor="fileUpload" style={uploadButtonStyle}>
              Upload
            </label>
            <input
              type="text"
              value={file ? file.name : ""}
              placeholder="No file selected"
              readOnly
              style={fileNameFieldStyle}
            />
          </div>

          {/* Buttons */}
          <div style={buttonContainerStyle}>
            <button type="submit" style={submitButtonStyle}>
              Submit
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={cancelButtonStyle}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Right side (SOP) */}
      <div style={rightSideStyle}>
        <h4>SOP - Repair Request</h4>
        {/* <ul>
          <li>Step 1: Contact your IT-SPOC first.</li>
          <li>Step 2: If unresolved, raise a request here.</li>
          <li>Step 3: Attach files if necessary.</li>
          <li>Step 4: New requirements need management approval.</li>
        </ul> */}
      </div>

      <ToastContainer />
    </div>
  );
}

/* ---------- Styles ---------- */
const containerStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  padding: "55px",
  backgroundColor: "#f5f9fc",
  minHeight: "100vh",
};

const leftSideStyle = { flex: 3 };
const rightSideStyle = {
  flex: 2,
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
};

const formStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const labelStyle = { fontWeight: "bold" };

const emailDisplayStyle = { marginBottom: "10px" };
const emailFieldStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "4px",
  border: "1px solid #ddd",
  backgroundColor: "#f9f9f9",
};
const emailNoteStyle = {
  color: "#666",
  fontSize: "0.8rem",
  fontStyle: "italic",
};

const textareaStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  resize: "vertical",
  fontSize: "1rem",
};

const fileUploadContainerStyle = { display: "flex", gap: "10px" };
const fileInputStyle = { display: "none" };
const uploadButtonStyle = {
  backgroundColor: "#7b61ff",
  color: "white",
  padding: "8px 16px",
  borderRadius: "4px",
  cursor: "pointer",
};
const fileNameFieldStyle = {
  flex: 1,
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  backgroundColor: "#f9f9f9",
};

const buttonContainerStyle = { display: "flex", gap: "10px" };
const submitButtonStyle = {
  backgroundColor: "#19c63a",
  color: "white",
  padding: "10px 20px",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
};
const cancelButtonStyle = {
  backgroundColor: "#f0f0f0",
  color: "#555",
  padding: "10px 20px",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
};

export default RepairRequest;
