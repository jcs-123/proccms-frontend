import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import './print.css';
import logo from "../assets/logo.png"; // ✅ Your logo inside assets

function PrintGatePass() {
  const { id } = useParams();
  const [gatePass, setGatePass] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/gatepass/${id}`)
      .then((res) => setGatePass(res.data))
      .catch((err) => console.error("Error fetching print data", err));
  }, [id]);

  useEffect(() => {
    if (gatePass) {
      setTimeout(() => window.print(), 1000);
    }
  }, [gatePass]);

  if (!gatePass) return <p>Loading...</p>;

  const { department, issuedTo, purpose, items, vehicleType, vehicleRegNo, date, type } = gatePass;
  const formattedDate = new Date(date).toLocaleDateString();

  return (
     <div className="print-area" style={{ fontFamily: "Arial", margin: "70px", color: "#000" }}>
    <div style={{ fontFamily: "Arial", margin: "70px", color: "#000" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <img src={logo} alt="Logo" style={{ height: "80px" }} />
        <div style={{ textAlign: "center", flexGrow: 1 }}>
          <h2 style={{ margin: 0 }}>JYOTHI ENGINEERING COLLEGE</h2>
          <h3 style={{ margin: "5px 0", textDecoration: "underline" }}>GATE PASS</h3>
        </div>
        <img src={logo} alt="Logo" style={{ height: "80px" }} />
      </div>

      {/* Meta Data */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
        <div><strong>Date:</strong> {formattedDate}</div>
        <div><strong>Type:</strong> {type}</div>
      </div>

      {/* Main Content */}
      <div style={{ marginTop: "20px" }}>
        <p><strong>Department:</strong> {department}</p>
        <p>
          The following items are issued to <strong>{issuedTo}</strong> for{" "}
          <strong>{purpose}</strong>
        </p>
        <ol>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
        <p>
          <strong>Vehicle Type:</strong> {vehicleType} &nbsp;&nbsp;
          <strong>Vehicle Reg. No.:</strong> {vehicleRegNo}
        </p>
      </div>

      {/* Slip Section */}
      <div style={{ borderTop: "2px solid #900", marginTop: "30px", paddingTop: "10px" }}>
        <p style={{ fontStyle: "italic", textAlign: "center" }}>
          Slip to be retained at Project Office
        </p>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <img src={logo} alt="Logo" style={{ height: "60px" }} />
          <img src={logo} alt="Logo" style={{ height: "60px" }} />
        </div>

        <ul style={{ fontSize: "0.85rem", marginTop: "10px" }}>
          <li><strong>Generated on:</strong> {new Date().toLocaleString()}</li>
          <li><strong>Department:</strong> {department}</li>
          <li><strong>Type:</strong> {type}</li>
          <li><strong>Vehicle Type:</strong> {vehicleType} & Vehicle Reg. No.: {vehicleRegNo}</li>
        </ul>
      </div>
    </div>
    </div>
  );
}

export default PrintGatePass;
