import React, { useState } from "react";
import { toast, ToastContainer } from 'react-toastify';

function RepairRequest() {
  const [description, setDescription] = useState("");
  const [isNewRequirement, setIsNewRequirement] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!description.trim()) return alert("Description required.");

  const formData = new FormData();
  formData.append("description", description);
  formData.append("isNewRequirement", isNewRequirement);
  formData.append("username", localStorage.getItem("name"));
  formData.append("role", localStorage.getItem("role"));
  formData.append("department", localStorage.getItem("department")); // ✅ Add this

  if (file) formData.append("file", file);

  try {
    const res = await fetch("http://localhost:5000/api/repair-requests", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      toast.success("Submitted successfully!", { position: "top-center" });
      handleCancel();
    } else {
      toast.error("Submission failed.", { position: "top-center" });
    }
  } catch (err) {
    toast.error("Error: " + err.message, { position: "top-center" });
  }
};

  const handleCancel = () => {
    setDescription("");
    setIsNewRequirement(false);
    setFile(null);
  };

  return (
    <div style={containerStyle}>
      {/* Left form side */}
      <form onSubmit={handleSubmit} style={formStyle}>
        <h3>Repair Request (For Project Office Only)</h3>
        <p style={{ fontStyle: "italic", fontSize: "0.9rem" }}>
          For Computer Center related issues contact your respective IT-SPOC first. They will try to resolve your issue or they will escalate it to CC Staff.
        </p>

        <label style={labelStyle}>
          Description of request<span style={{ color: "red" }}>*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          style={textareaStyle}
          placeholder="Enter description"
          required
        />

        <div style={{ margin: "10px 0" }}>
          <label style={{ fontWeight: "bold" }}>
            Is it a new requirement?(Will be done after getting approval by the management){" "}
            <input
              type="checkbox"
              checked={isNewRequirement}
              onChange={(e) => setIsNewRequirement(e.target.checked)}
              style={{ transform: "scale(1.2)", marginLeft: "10px" }}
            />
          </label>
        </div>

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

        <div style={buttonContainerStyle}>
          <button type="submit" style={submitButtonStyle}>
            Submit
          </button>
          <button type="button" onClick={handleCancel} style={cancelButtonStyle}>
            Cancel
          </button>
        </div>
      </form>

      {/* Right SOP side */}
      <div style={sopStyle}>
        <h4>SOP - Repair Request</h4>
        {/* SOP content can go here */}
      </div>
      <ToastContainer autoClose={1000} position="top-center" />

    </div>
  );
};

// Styles

const containerStyle = {
  display: "flex",
  gap: "20px",
  padding: "20px",
  backgroundColor: "#f5f9fc",
  height: "100%",
  boxSizing: "border-box",
  marginTop: "40px",
};

const formStyle = {
  flex: 3,
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const labelStyle = {
  fontWeight: "bold",
};

const textareaStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  resize: "vertical",
  fontSize: "1rem",
};

const fileUploadContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const fileInputStyle = {
  display: "none",
};

const uploadButtonStyle = {
  backgroundColor: "#7b61ff",
  color: "white",
  padding: "8px 16px",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "600",
  userSelect: "none",
};

const fileNameFieldStyle = {
  flex: 1,
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "0.9rem",
  backgroundColor: "#f9f9f9",
  color: "#333",
};

const buttonContainerStyle = {
  display: "flex",
  gap: "10px",
};

const submitButtonStyle = {
  backgroundColor: "#19c63a",
  color: "white",
  padding: "10px 20px",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
};

const cancelButtonStyle = {
  backgroundColor: "#f0f0f0",
  color: "#555",
  padding: "10px 20px",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
};

const sopStyle = {
  flex: 2,
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
  minHeight: "300px",
};

export default RepairRequest;
