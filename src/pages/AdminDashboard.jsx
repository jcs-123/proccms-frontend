import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaClipboardList, FaTools, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [summary, setSummary] = useState({ assigned: 0, pending: 0, completed: 0 });
  const [staffSummary, setStaffSummary] = useState([]);
  const [roomRequests, setRoomRequests] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchDashboardData = async (customFrom, customTo) => {
    try {
      const params = {};
      if (customFrom && customTo) {
        params.from = customFrom;
        params.to = customTo;
      }

      const [summaryRes, staffRes, roomRes] = await Promise.all([
        axios.get("https://proccms-backend.onrender.com/api/admin/repair-summary"),
        axios.get("https://proccms-backend.onrender.com/api/admin/repair-staff-summary", { params }),
        axios.get("https://proccms-backend.onrender.com/api/admin/room-requests")

      ]);

      setSummary(summaryRes.data);
      setStaffSummary(staffRes.data);
      setRoomRequests(roomRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleSearch = () => {
    if (fromDate && toDate) {
      fetchDashboardData(fromDate, toDate);
    }
  };

  const handleCardClick = (type) => {
    if (type === "assigned") {
      navigate("/repair-list?filter=assigned");
    } else if (type === "pending") {
      navigate("/repair-list?filter=pending");
    } else if (type === "room") {
      navigate("/booking-calender");
    }
  };

  const topCards = [
    {
      title: "Assigned Repair Requests",
      count: summary.assigned,
      color: "#ffcc00",
      icon: <FaClipboardList size={40} color="#ffcc00" />,
      onClick: () => handleCardClick("assigned"),
    },
    {
      title: "Pending Repair Requests",
      count: summary.pending,
      color: "#ff6666",
      icon: <FaTools size={40} color="#ff6666" />,
      onClick: () => handleCardClick("pending"),
    },
    {
      title: "Room Requests",
      count: roomRequests.reduce((sum, r) => sum + r.count, 0),
      color: "#8e44ad",
      icon: <FaCalendarAlt size={40} color="#8e44ad" />,
      onClick: () => handleCardClick("room"),
    }
  ];

  const styles = getStyles(windowWidth);

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <div style={styles.cardContainer}>
          {topCards.map((card, index) => (
            <div
              key={index}
              style={{ ...styles.card, cursor: "pointer" }}
              onClick={card.onClick}
            >
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>{card.icon}</div>
              <div style={{ fontWeight: "bold", color: "#555" }}>{card.title}</div>
              <div style={{ fontSize: "28px", color: card.color }}>{card.count}</div>
            </div>
          ))}
        </div>

        <div style={styles.tableBox}>
          <h3 className="mb-3 fs-6">Repair Request Details</h3>

          <div style={styles.filter}>
            <label style={styles.label}>Date from</label>
            <div style={styles.inputWithIcon}>
              <FaCalendarAlt style={styles.calendarIcon} />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>

            <label style={styles.label}>Date to</label>
            <div style={styles.inputWithIcon}>
              <FaCalendarAlt style={styles.calendarIcon} />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>

            <button style={styles.button} onClick={handleSearch}>Search</button>
          </div>

          <div style={styles.summary}>
            <span style={{ color: "#e74c3c" }}>Pending Request Count : {summary.pending}</span>
            <span style={{ color: "#f39c12" }}>Assigned Request Count : {summary.assigned}</span>
            <span style={{ color: "#27ae60" }}>Completed Request Count : {summary.completed}</span>
          </div>

          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead style={{ background: "#f4f4f4" }}>
                <tr>
                  <th style={styles.tableTh}>Employee Name</th>
                  <th style={styles.tableTh}>Assigned Request</th>
                  <th style={styles.tableTh}>Completed Request</th>
                </tr>
              </thead>
              <tbody>
                {staffSummary.map((row, idx) => (
                  <tr key={idx}>
                    <td style={styles.tableTd}>{row.name}</td>
                    <td style={styles.tableTd}>{row.assigned}</td>
                    <td style={styles.tableTd}>{row.completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={styles.sidebar}>
        <h5 style={{ fontWeight: "600", marginBottom: "10px" }}>Room Request</h5>
        <div style={styles.roomListBox}>
          {roomRequests.map((item, index) => (
            <div key={index} style={styles.roomBoxItem}>
              <span>{item.name}</span>
              <span style={{ fontWeight: "bold" }}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getStyles = (width) => {
  const isMobile = width < 768;

  return {
    container: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: "20px",
      flexWrap: "wrap",
    },
    main: {
      flex: 3,
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    cardContainer: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: "20px",
      justifyContent: "space-between",
      flexWrap: "wrap",
    },
    card: {
      flex: isMobile ? "1 1 100%" : "1 1 30%",
      background: "#fff",
      borderRadius: "8px",
      boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
      padding: "50px",
      textAlign: "center",
      marginTop: "20px",
      transition: "transform 0.2s",
    },
    tableBox: {
      background: "#fff",
      padding: "10px",
      borderRadius: "8px",
      boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
    },
    filter: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: "center",
      gap: "10px",
      marginBottom: "10px",
      flexWrap: "wrap",
    },
    button: {
      padding: "5px 15px",
      background: "#2980b9",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },

    summary: {
      display: "flex",
      gap: "12px",
      marginBottom: "10px",
      fontWeight: "bold",
      justifyContent: "center", // ⬅️ centers the line
      flexWrap: "nowrap",       // ⬅️ prevents wrapping
    },

    tableScroll: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      border: "1px solid #ccc",
    },
    tableTh: {
      padding: "10px",
      textAlign: "left",
      border: "1px solid #ccc",
      backgroundColor: "#f4f4f4",
    },
    tableTd: {
      padding: "10px",
      border: "1px solid #ccc",
    },
    sidebar: {
      flex: 1,
      background: "#fff",
      padding: "55px",
      borderRadius: "8px",
      boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
    },
    roomListBox: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    roomBoxItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#f9fcff",
      border: "1px solid #e0e0e0",
      borderRadius: "4px",
      padding: "6px 10px",
      fontSize: "14px",
      color: "#333",
    },
    label: {
      fontWeight: "500",
    },
    inputWithIcon: {
      position: "relative",
    },
    calendarIcon: {
      position: "absolute",
      top: "50%",
      left: "10px",
      transform: "translateY(-50%)",
      color: "#2980b9",
      pointerEvents: "none",
    },
    dateInput: {
      padding: "6px 10px 6px 30px",
      borderRadius: "4px",
      border: "1px solid #ccc",
    },
  };
};

export default Dashboard;