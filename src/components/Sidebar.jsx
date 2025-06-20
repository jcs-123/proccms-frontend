import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";

function Sidebar({ role }) {
  const [isProjectOfficeOpen, setIsProjectOfficeOpen] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleProjectOffice = () => setIsProjectOfficeOpen(!isProjectOfficeOpen);

  const linkStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 16px",
    color: "#495057",
    textDecoration: "none",
    fontSize: "0.92rem",
    cursor: "pointer",
    userSelect: "none",
    borderRadius: "4px",
    transition: "background-color 0.2s ease",
  };

  const linkHoverStyle = {
    backgroundColor: "#e9ecef",
    color: "#0d6efd",
  };

  const iconStyle = {
    fontSize: "18px",
    color: "#6c757d",
    flexShrink: 0,
  };

  const roleBasedLinks = {
    admin: [
      { to: "/repair-request", icon: "bi-wrench", label: "Repair Request" },
      { to: "/repair-list", icon: "bi-list-check", label: "Repair Request List" },
      { to: "/room-booking", icon: "bi-file-text", label: "Room Booking" },
      { to: "/booking-calender", icon: "bi-calendar-event", label: "Booking Calendar" },
      { to: "/roombooking-list", icon: "bi-list-ul", label: "Room Booking List" },
      { to: "/gatepass", icon: "bi-door-open", label: "Gate Pass" },
      { to: "/vehicle-pass", icon: "bi-car-front", label: "Vehicle Pass" },
      { to: "/admin/add-staff", icon: "bi-person-plus", label: "Add Staff" },
      { to: "/admin/get-data", icon: "bi bi-qr-code", label: "VehiclePassScanner" },
    ],
    user: [
      { to: "/repair-request", icon: "bi-wrench", label: "Repair Request" },
      { to: "/my-repair-requests", icon: "bi-list-check", label: "Repair Request List" },
      { to: "/room-booking", icon: "bi-file-text", label: "Room Booking" },
      { to: "/my-bookings", icon: "bi-list-ul", label: "Room Booking List" },
    ],
    staff: [
      { to: "/repair-request", icon: "bi-wrench", label: "Repair Request" },
      { to: "/staff/repair-requests", icon: "bi-list-check", label: "Repair Request List" },
      { to: "/room-booking", icon: "bi-file-text", label: "Room Booking" },
      { to: "/assigned-bookings", icon: "bi-list-ul", label: "Room Booking List" },
    ],
  };

  const links = roleBasedLinks[role] || [];

  return (
    <>
      {/* Toggle Button (top-left desktop, top-right mobile) */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: 15,
            right: 15,
            zIndex: 1100,
            backgroundColor: "#0d6efd",
            border: "none",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          aria-label="Toggle sidebar"
        >
          <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`} style={{ fontSize: 20 }}></i>
        </button>
      )}

      {/* {isMobile && (
        <button
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: 15,
            right: 15,
            zIndex: 1100,
            backgroundColor: "white",      // white background
            border: "1px solid #0d6efd",   // blue border (optional)
            padding: "8px",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Toggle sidebar"
        >
          <i
            className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}
            style={{
              fontSize: 20,
              color: "#0d6efd", // blue icon color
            }}
          ></i>
        </button>
      )} */}


      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 999,
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          width: 280,
          height: "100vh",
          backgroundColor: "#f8f9fa",
          overflowY: "auto",
          paddingTop: "70px",
          fontFamily: "Arial, sans-serif",
          position: "fixed",
          top: 0,
          left: sidebarOpen ? 0 : "-300px",
          transition: "left 0.3s ease",
          zIndex: 1000,
          boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
        }}
      >
        {/* Dashboard */}
        <div style={{ margin: "10px 0 1rem 0" }}>
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              ...linkStyle,
              color: isActive ? "white" : "#0d6efd",
              fontWeight: 600,
              backgroundColor: isActive ? "#0d6efd" : "transparent",
            })}
            onMouseEnter={() => setHoveredIndex("dashboard")}
            onMouseLeave={() => setHoveredIndex(null)}
            end
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <i className="bi bi-house" style={iconStyle}></i>
            Dashboard
          </NavLink>
        </div>

        {/* Section Title + Dropdown */}
        <div>
          <div
            onClick={toggleProjectOffice}
            style={{
              ...linkStyle,
              fontWeight: 600,
              justifyContent: "space-between",
              backgroundColor: isProjectOfficeOpen ? "#e9ecef" : "transparent",
              borderRadius: "4px",
            }}
            onMouseEnter={() => setHoveredIndex("projectOffice")}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  backgroundColor: "#e9ecef",
                  color: "#6c757d",
                  fontSize: "0.65rem",
                  fontWeight: "700",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  letterSpacing: "0.8px",
                }}
              >
                NEW
              </span>
              Project Office Management
            </div>
            <i
              className={`bi ${isProjectOfficeOpen ? "bi-caret-down-fill" : "bi-caret-right-fill"}`}
              style={{ fontSize: "16px", color: "#6c757d" }}
            />
          </div>

          {/* Dropdown Links */}
          {isProjectOfficeOpen && (
            <ul style={{ listStyleType: "none", paddingLeft: "1.8rem", marginTop: "0.5rem" }}>
              {links.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    style={{
                      ...linkStyle,
                      ...(hoveredIndex === idx ? linkHoverStyle : {}),
                    }}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <i className={`bi ${link.icon}`} style={iconStyle}></i>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;
