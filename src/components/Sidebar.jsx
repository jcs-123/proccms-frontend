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
    padding: "10px 20px",
    color: "#343a40",
    textDecoration: "none",
    fontSize: "0.95rem",
    borderRadius: "6px",
    fontWeight: 500,
    transition: "all 0.2s ease",
  };

  const linkHoverStyle = {
    backgroundColor: "#f1f3f5",
    color: "#0d6efd",
    fontWeight: 600,
  };

  const iconStyle = {
    fontSize: "1.1rem",
    color: "#0d6efd",
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
      { to: "/admin/get-data", icon: "bi bi-qr-code", label: "VehiclePass Scanner" },
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
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 1100,
            backgroundColor: "#0d6efd",
            border: "none",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            cursor: "pointer",
          }}
          aria-label="Toggle sidebar"
        >
          <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`} style={{ fontSize: 20 }}></i>
        </button>
      )}

      {/* Overlay on Mobile */}
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
          backgroundColor: "#ffffff",
          overflowY: "auto",
          paddingTop: "60px",
          position: "fixed",
          top: 0,
          left: sidebarOpen ? 0 : "-300px",
          transition: "left 0.3s ease",
          zIndex: 1000,
          boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
        }}
      >
        {/* Dashboard Link */}
        <div style={{ margin: "10px 0 1rem 0" }}>
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              ...linkStyle,
              backgroundColor: isActive ? "#e7f1ff" : "transparent",
              color: isActive ? "#0d6efd" : "#495057",
              fontWeight: isActive ? "600" : "500",
            })}
            end
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <i className="bi bi-house" style={iconStyle}></i>
            Dashboard
          </NavLink>
        </div>

        {/* Project Office Section */}
        <div>
          <div
            onClick={toggleProjectOffice}
            style={{
              ...linkStyle,
              fontWeight: 600,
              justifyContent: "space-between",
              borderRadius: "4px",
              backgroundColor: "#f8f9fa",
              marginBottom: "4px",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  backgroundColor: "#e7f1ff",
                  color: "#0d6efd",
                  fontSize: "0.65rem",
                  fontWeight: "700",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  letterSpacing: "0.6px",
                }}
              >
                SECTION
              </span>
              Project Office
            </div>
            <i
              className={`bi ${isProjectOfficeOpen ? "bi-caret-down-fill" : "bi-caret-right-fill"}`}
              style={{ fontSize: "16px", color: "#6c757d" }}
            />
          </div>

          {isProjectOfficeOpen && (
            <ul style={{ listStyleType: "none", paddingLeft: "1rem" }}>
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
