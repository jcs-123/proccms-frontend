import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/AdminDashboard";
import RepairRequest from "./pages/RepairRequest";
import RepairList from "./pages/RepairList";
import RoomBooking from "./pages/RoomBooking";
import BookingCalendar from "./pages/BookingCalendar";
import RoomBookingList from "./pages/RoomBookingList";
import GatePass from "./pages/GatePass";
import NewGatePassForm from "./pages/NewGatePassForm";
import VehiclePass from "./pages/VehiclePass";
import NewVehiclePassForm from "./pages/NewVehiclePassForm";
import AddStaff from "./pages/AddStaff";
import UserDashboard from "./pages/UserDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import MyRepairRequests from "./pages/MyRepairRequests";
import MyRoomBookings from "./pages/MyRoomBookings";
import StaffRepairList from "./pages/StaffRepairList";
import PrintGatePass from "./pages/PrintGatePass";
import EditGatePassForm from "./pages/EditGatePassForm";
import VehiclePassForm from "./pages/VehiclePassForm";
import AssignedBookings from "./pages/AssignedBookings";
import Login from "./pages/LoginPage";
import VehicleGetdata from "./pages/VehicleGetdata";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
  const verifyLogin = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const res = await fetch("https://proccms-backend.onrender.com/api/auth/verify", {
        headers: { Authorization: token },
      });

      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        setRole(data.role);
      } else {
        localStorage.clear();
        setIsLoggedIn(false);
        setRole(null);
      }
    } catch (err) {
      console.error("Verification failed:", err);
      localStorage.clear();
      setIsLoggedIn(false);
      setRole(null);
    }
  };

  verifyLogin();
}, []);


  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setRole(null);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setRole(localStorage.getItem("role"));
  };

  return (
    <Router>
      {isLoggedIn ? (
        <div style={{ height: "100vh", overflow: "hidden", backgroundColor: "#f9f9f9" }}>
          <Sidebar role={role} />
          <div
            style={{
              marginLeft: isMobile ? 0 : "280px",
              transition: "margin 0.3s ease",
              display: "flex",
              flexDirection: "column",
              height: "100vh",
            }}
          >
            <Navbar onLogout={handleLogout} />
            <main
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                backgroundColor: "#f9f9f9",
                minHeight: 0,
              }}
            >
              <Routes>
                {/* Admin Routes */}
                {role === "admin" && (
                  <>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/repair-request" element={<RepairRequest />} />
                    <Route path="/repair-list" element={<RepairList />} />
                    <Route path="/room-booking" element={<RoomBooking />} />
                    <Route path="/booking-calender" element={<BookingCalendar />} />
                    <Route path="/roombooking-list" element={<RoomBookingList />} />
                    <Route path="/gatepass" element={<GatePass />} />
                    <Route path="/gate-pass/new" element={<NewGatePassForm />} />
                    <Route path="/gate-pass/edit/:id" element={<EditGatePassForm />} />
                    <Route path="/gate-pass/print/:id" element={<PrintGatePass />} />
                    <Route path="/vehicle-pass" element={<VehiclePass />} />
                    <Route path="/vehicle-pass/edit/:passId" element={<VehiclePassForm />} />
                    <Route path="/vehicle-pass/new" element={<NewVehiclePassForm />} />
                    <Route path="/admin/add-staff" element={<AddStaff />} />
                    <Route path="/admin/get-data" element={<VehicleGetdata />} />

                  </>
                )}

                {/* User Routes */}
                {role === "user" && (
                  <>
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route path="/repair-request" element={<RepairRequest />} />
                    <Route path="/my-repair-requests" element={<MyRepairRequests />} />
                    <Route path="/room-booking" element={<RoomBooking />} />
                    <Route path="/roombooking-list" element={<RoomBookingList />} />
                    <Route path="/my-bookings" element={<MyRoomBookings />} />
                    <Route path="/booking-calender" element={<BookingCalendar />} />
                  </>
                )}

                {/* Staff Routes */}
                {role === "staff" && (
                  <>
                    <Route path="/dashboard" element={<StaffDashboard />} />
                    <Route path="/repair-request" element={<RepairRequest />} />
                    <Route path="/staff/repair-requests" element={<StaffRepairList />} />
                    <Route path="/room-booking" element={<RoomBooking />} />
                    <Route path="/assigned-bookings" element={<AssignedBookings />} />
                    <Route path="/booking-calender" element={<BookingCalendar />} />
                  </>
                )}

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
