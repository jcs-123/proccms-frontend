import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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
      if (customFrom && customTo) params.from = customFrom, params.to = customTo;

      const [summaryRes, staffRes, roomRes] = await Promise.all([
        axios.get("https://proccms-backend.onrender.com/api/admin/repair-summary"),
        axios.get("https://proccms-backend.onrender.com/api/admin/repair-staff-summary", { params }),
        axios.get("https://proccms-backend.onrender.com/api/admin/room-requests"),
      ]);

      setSummary(summaryRes.data);
      setStaffSummary(staffRes.data);
      setRoomRequests(roomRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleSearch = () => {
    if (fromDate && toDate) fetchDashboardData(fromDate, toDate);
  };

  const handleCardClick = (type) => {
    if (type === "assigned") navigate("/repair-list?filter=assigned");
    else if (type === "pending") navigate("/repair-list?filter=pending");
    else if (type === "room") navigate("/booking-calender");
  };

  const topCards = [
    {
      title: "Assigned Repair Requests",
      count: summary.assigned,
      color: "#f1c40f",
      icon: <FaClipboardList size={36} color="#f1c40f" />,
      onClick: () => handleCardClick("assigned"),
    },
    {
      title: "Pending Repair Requests",
      count: summary.pending,
      color: "#e74c3c",
      icon: <FaTools size={36} color="#e74c3c" />,
      onClick: () => handleCardClick("pending"),
    },
    {
      title: "Room Requests",
      count: roomRequests.reduce((sum, r) => sum + r.count, 0),
      color: "#8e44ad",
      icon: <FaCalendarAlt size={36} color="#8e44ad" />,
      onClick: () => handleCardClick("room"),
    },
  ];

  const styles = getStyles(windowWidth);

  // Animation variants
  const containerVariant = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const rowVariant = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="dashboard-container"
      style={styles.container}
      initial="hidden"
      animate="show"
      variants={containerVariant}
    >
      <motion.div style={styles.main}>
        {/* === Animated Summary Cards === */}
        <motion.div
          className="card-container"
          style={styles.cardContainer}
          variants={containerVariant}
        >
          {topCards.map((card, index) => (
            <motion.div
              key={index}
              variants={cardVariant}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              style={{ ...styles.card, borderTop: `36px solid ${card.color}` }}
              onClick={card.onClick}
            >
              <div>{card.icon}</div>
              <div style={{ fontWeight: 600, color: "#333" }}>{card.title}</div>
              <div style={{ fontSize: "1.7rem", color: card.color, fontWeight: "bold" }}>
                {card.count}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* === Filter Section === */}
        <motion.div style={styles.tableBox} variants={cardVariant}>
          <h3 className="mb-3" style={{ fontSize: "1.05rem", fontWeight: 600 }}>
            Repair Request Details
          </h3>

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

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={styles.button}
              onClick={handleSearch}
            >
              Search
            </motion.button>
          </div>

          {/* === Summary === */}
          <motion.div style={styles.summary}>
            <span style={{ color: "#e74c3c" }}>Pending: {summary.pending}</span>
            <span style={{ color: "#f39c12" }}>Assigned: {summary.assigned}</span>
            <span style={{ color: "#27ae60" }}>Completed: {summary.completed}</span>
          </motion.div>

          {/* === Staff Table === */}
          <motion.div style={styles.tableScroll} variants={containerVariant}>
            <motion.table style={styles.table}>
              <thead style={{ background: "#f4f4f4" }}>
                <tr>
                  <th style={styles.tableTh}>Employee Name</th>
                  <th style={styles.tableTh}>Assigned Request</th>
                  <th style={styles.tableTh}>Completed Request</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {staffSummary.map((row, idx) => (
                    <motion.tr
                      key={idx}
                      variants={rowVariant}
                      initial="hidden"
                      animate="show"
                      exit={{ opacity: 0 }}
                      whileHover={{ backgroundColor: "#f9f9f9", scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      <td style={{ ...styles.tableTd, fontWeight: "bold", color: "#333" }}>
                        {row.name}
                      </td>
                      <td style={styles.tableTd}>{row.assigned}</td>
                      <td style={styles.tableTd}>{row.completed}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </motion.table>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* === Sidebar (Room Requests) === */}
      <motion.div
        style={styles.sidebar}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h4
          style={{
            fontWeight: "600",
            marginBottom: "10px",
            paddingTop: "20px",   // 👈 adds space above
          }}
        >
          Room Request
        </h4>

        <div style={styles.roomListBox}>
          {roomRequests.map((item, index) => (
            <motion.div
              key={index}
              style={styles.roomBoxItem}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <span>{item.name}</span>
              <span style={{ fontWeight: "bold", color: "#2563eb" }}>{item.count}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const getStyles = (width) => {
  const isMobile = width < 768;
  return {
    container: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: "20px",
      padding: "10px",
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
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      padding: "35px 20px",
      textAlign: "center",
      transition: "transform 0.3s ease",
    },
    tableBox: {
      background: "#fff",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    },
    filter: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: "center",
      gap: "10px",
      marginBottom: "10px",
    },
    button: {
      padding: "6px 16px",
      background: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "500",
    },
    summary: {
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      fontWeight: "600",
      marginBottom: "10px",
    },
    tableScroll: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "0.9rem",
    },
    tableTh: {
      padding: "10px",
      textAlign: "left",
      borderBottom: "2px solid #ddd",
      background: "#f9fafb",
    },
    tableTd: {
      padding: "10px",
      borderBottom: "1px solid #eee",
      color: "#444",
    },
    sidebar: {
      flex: 1,
      background: "#fff",
      padding: "25px",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      height: "fit-content",
    },
    roomListBox: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    roomBoxItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#f8faff",
      border: "1px solid #e0e6f5",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "14px",
    },
    inputWithIcon: {
      position: "relative",
    },
    calendarIcon: {
      position: "absolute",
      top: "50%",
      left: "10px",
      transform: "translateY(-50%)",
      color: "#2563eb",
    },
    dateInput: {
      padding: "6px 10px 6px 30px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "0.9rem",
    },
    label: {
      fontWeight: "500",
      color: "#333",
    },
  };
};

export default Dashboard;




// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FaClipboardList, FaTools, FaCalendarAlt } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// const Dashboard = () => {
//   const [summary, setSummary] = useState({ assigned: 0, pending: 0, completed: 0 });
//   const [staffSummary, setStaffSummary] = useState([]);
//   const [roomRequests, setRoomRequests] = useState([]);
//   const [windowWidth, setWindowWidth] = useState(window.innerWidth);
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchDashboardData();
//     const handleResize = () => setWindowWidth(window.innerWidth);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const fetchDashboardData = async (customFrom, customTo) => {
//     try {
//       const params = {};
//       if (customFrom && customTo) {
//         params.from = customFrom;
//         params.to = customTo;
//       }

//       const [summaryRes, staffRes, roomRes] = await Promise.all([
//         axios.get("https://proccms-backend.onrender.com/api/admin/repair-summary"),
//         axios.get("https://proccms-backend.onrender.com/api/admin/repair-staff-summary", { params }),
//         axios.get("https://proccms-backend.onrender.com/api/admin/room-requests"),
//       ]);

//       setSummary(summaryRes.data);
//       setStaffSummary(staffRes.data);
//       setRoomRequests(roomRes.data);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     }
//   };

//   const handleSearch = () => {
//     if (fromDate && toDate) {
//       fetchDashboardData(fromDate, toDate);
//     }
//   };

//   const handleCardClick = (type) => {
//     if (type === "assigned") {
//       navigate("/repair-list?filter=assigned");
//     } else if (type === "pending") {
//       navigate("/repair-list?filter=pending");
//     } else if (type === "room") {
//       navigate("/booking-calender");
//     }
//   };

//   const topCards = [
//     {
//       title: "Assigned Repair Requests",
//       count: summary.assigned,
//       color: "#ffcc00",
//       icon: <FaClipboardList size={40} color="#ffcc00" />,
//       onClick: () => handleCardClick("assigned"),
//     },
//     {
//       title: "Pending Repair Requests",
//       count: summary.pending,
//       color: "#ff6666",
//       icon: <FaTools size={40} color="#ff6666" />,
//       onClick: () => handleCardClick("pending"),
//     },
//     {
//       title: "Room Requests",
//       count: roomRequests.reduce((sum, r) => sum + r.count, 0),
//       color: "#8e44ad",
//       icon: <FaCalendarAlt size={40} color="#8e44ad" />,
//       onClick: () => handleCardClick("room"),
//     },
//   ];

//   const styles = getStyles(windowWidth);

//   return (
//     <div style={styles.container}>
//       <div style={styles.main}>
//         <div style={styles.cardContainer}>
//           {topCards.map((card, index) => (
//             <div
//               key={index}
//               style={{ ...styles.card, cursor: "pointer" }}
//               onClick={card.onClick}
//             >
//               <div style={{ fontSize: "24px", marginBottom: "10px" }}>{card.icon}</div>
//               <div style={{ fontWeight: "bold", color: "#555" }}>{card.title}</div>
//               <div style={{ fontSize: "28px", color: card.color }}>{card.count}</div>
//             </div>
//           ))}
//         </div>

//         <div style={styles.tableBox}>
//           <h3 className="mb-3 fs-6">Repair Request Details</h3>

//           <div style={styles.filter}>
//             <label style={styles.label}>Date from</label>
//             <div style={styles.inputWithIcon}>
//               <FaCalendarAlt style={styles.calendarIcon} />
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 style={styles.dateInput}
//               />
//             </div>

//             <label style={styles.label}>Date to</label>
//             <div style={styles.inputWithIcon}>
//               <FaCalendarAlt style={styles.calendarIcon} />
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 style={styles.dateInput}
//               />
//             </div>

//             <button style={styles.button} onClick={handleSearch}>Search</button>
//           </div>

//           <div style={styles.summary}>
//             <span style={{ color: "#e74c3c" }}>Pending Request Count : {summary.pending}</span>
//             <span style={{ color: "#f39c12" }}>Assigned Request Count : {summary.assigned}</span>
//             <span style={{ color: "#27ae60" }}>Completed Request Count : {summary.completed}</span>
//           </div>

//           <div style={styles.tableScroll}>
//             <table style={styles.table}>
//               <thead style={{ background: "#f4f4f4" }}>
//                 <tr>
//                   <th style={styles.tableTh}>Employee Name</th>
//                   <th style={styles.tableTh}>Assigned Request</th>
//                   <th style={styles.tableTh}>Completed Request</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {staffSummary.map((row, idx) => (
//                   <tr key={idx}>
//                     <td style={styles.tableTd}>{row.name}</td>
//                     <td style={styles.tableTd}>{row.assigned}</td>
//                     <td style={styles.tableTd}>{row.completed}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       <div style={styles.sidebar}>
//         <h5 style={{ fontWeight: "600", marginBottom: "10px" }}>Room Request</h5>
//         <div style={styles.roomListBox}>
//           {roomRequests.map((item, index) => (
//             <div key={index} style={styles.roomBoxItem}>
//               <span>{item.name}</span>
//               <span style={{ fontWeight: "bold" }}>{item.count}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// const getStyles = (width) => {
//   const isMobile = width < 768;

//   return {
//     container: {
//       display: "flex",
//       flexDirection: isMobile ? "column" : "row",
//       gap: "20px",
//       flexWrap: "wrap",
//     },
//     main: {
//       flex: 3,
//       display: "flex",
//       flexDirection: "column",
//       gap: "20px",
//     },
//     cardContainer: {
//       display: "flex",
//       flexDirection: isMobile ? "column" : "row",
//       gap: "20px",
//       justifyContent: "space-between",
//       flexWrap: "wrap",
//     },
//     card: {
//       flex: isMobile ? "1 1 100%" : "1 1 30%",
//       background: "#fff",
//       borderRadius: "8px",
//       boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
//       padding: "50px",
//       textAlign: "center",
//       marginTop: "20px",
//       transition: "transform 0.2s",
//     },
//     tableBox: {
//       background: "#fff",
//       padding: "10px",
//       borderRadius: "8px",
//       boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
//       display: "flex",
//       flexDirection: "column",
//     },
//     filter: {
//       display: "flex",
//       flexDirection: isMobile ? "column" : "row",
//       alignItems: "center",
//       gap: "10px",
//       marginBottom: "10px",
//       flexWrap: "wrap",
//     },
//     button: {
//       padding: "5px 15px",
//       background: "#2980b9",
//       color: "#fff",
//       border: "none",
//       borderRadius: "4px",
//       cursor: "pointer",
//     },
    
//     summary: {
//       display: "flex",
//       gap: "12px",
//       marginBottom: "10px",
//       fontWeight: "bold",
//       justifyContent: "center", // ⬅️ centers the line
//       flexWrap: "nowrap",       // ⬅️ prevents wrapping
//     },

//     tableScroll: {
//       overflowX: "auto",
//     },
//     table: {
//       width: "100%",
//       borderCollapse: "collapse",
//       border: "1px solid #ccc",
//     },
//     tableTh: {
//       padding: "10px",
//       textAlign: "left",
//       border: "1px solid #ccc",
//       backgroundColor: "#f4f4f4",
//     },
//     tableTd: {
//       padding: "10px",
//       border: "1px solid #ccc",
//     },
//     sidebar: {
//       flex: 1,
//       background: "#fff",
//       padding: "55px",
//       borderRadius: "8px",
//       boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
//     },
//     roomListBox: {
//       display: "flex",
//       flexDirection: "column",
//       gap: "6px",
//     },
//     roomBoxItem: {
//       display: "flex",
//       justifyContent: "space-between",
//       alignItems: "center",
//       background: "#f9fcff",
//       border: "1px solid #e0e0e0",
//       borderRadius: "4px",
//       padding: "6px 10px",
//       fontSize: "14px",
//       color: "#333",
//     },
//     label: {
//       fontWeight: "500",
//     },
//     inputWithIcon: {
//       position: "relative",
//     },
//     calendarIcon: {
//       position: "absolute",
//       top: "50%",
//       left: "10px",
//       transform: "translateY(-50%)",
//       color: "#2980b9",
//       pointerEvents: "none",
//     },
//     dateInput: {
//       padding: "6px 10px 6px 30px",
//       borderRadius: "4px",
//       border: "1px solid #ccc",
//     },
//   };
// };

// export default Dashboard;