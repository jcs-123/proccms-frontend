import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import loginBackground from "../assets/login.jpg";
import "react-toastify/dist/ReactToastify.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://proccms-backend.onrender.com/api/auth/login",
        { username, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("department", res.data.department || "Unknown Department");
      localStorage.setItem("email", res.data.email || "");
      localStorage.setItem("phone", res.data.phone || "");

      toast.success(`Login successful as ${res.data.role}`, {
        position: "top-center",
        autoClose: 1200,
        onClose: () => {
          onLogin();
          if (res.data.role === "admin") navigate("/admin-dashboard");
          else if (res.data.role === "staff") navigate("/staff-dashboard");
          else navigate("/dashboard");
        },
      });
    } catch (err) {
      toast.error("Invalid credentials. Please try again.", {
        position: "top-center",
        autoClose: 1200,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9 }}
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        padding: "1rem",
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
      {/* gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(3px)",
        }}
      ></div>

      {/* main login card */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="p-4 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "18px",
          zIndex: 2,
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.25)",
        }}
      >
        <motion.h4
          className="fw-bold text-center mb-3"
          style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontSize: "1.4rem",
            letterSpacing: "0.4px",
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Project Office Management System
        </motion.h4>

        {/* Form Section */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Username */}
          <div className="mb-3 position-relative">
            <label htmlFor="username" className="form-label fw-semibold">
              Username
            </label>
            <motion.input
              whileFocus={{ scale: 1.02, borderColor: "#2563eb" }}
              transition={{ type: "spring", stiffness: 300 }}
              type="text"
              className="form-control"
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              style={{ fontSize: "0.95rem", padding: "0.6rem 0.75rem" }}
            />
            {username.trim() !== "" && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "65%",
                  transform: "translateY(-50%)",
                  color: "green",
                }}
              >
                ✓
              </motion.span>
            )}
          </div>

          {/* Password */}
          <div className="mb-4 position-relative">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <motion.input
              whileFocus={{ scale: 1.02, borderColor: "#2563eb" }}
              transition={{ type: "spring", stiffness: 300 }}
              type={showPassword ? "text" : "password"}
              className="form-control pe-5"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ fontSize: "0.95rem", padding: "0.6rem 0.75rem" }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                top: "65%",
                right: "12px",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#6b7280",
                fontSize: "1.2rem",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Submit Button */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <button
              type="submit"
              className="btn w-100 fw-semibold"
              style={{
                background:
                  "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
                border: "none",
                color: "white",
                padding: "0.7rem",
                borderRadius: "10px",
                fontSize: "1rem",
                letterSpacing: "0.3px",
                boxShadow: "0 4px 10px rgba(37,99,235,0.3)",
              }}
            >
              Sign In
            </button>
          </motion.div>
        </motion.form>

        {/* Footer */}
        <motion.p
          className="text-center text-muted mt-4"
          style={{
            fontSize: "0.8rem",
            lineHeight: "1.3rem",
            userSelect: "none",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          © 2025 tbi@jec, Jyothi Engineering College <br /> All rights reserved.
        </motion.p>
      </motion.div>

      <ToastContainer position="top-center" autoClose={2500} />
    </motion.div>
  );
}

export default Login;



// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import loginBackground from '../assets/login.jpg';

// function Login({ onLogin }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await axios.post('http://localhost:5000/api/auth/login', {
//         username,
//         password,
//       });

//       localStorage.setItem('token', res.data.token);
//       localStorage.setItem('role', res.data.role);
//       localStorage.setItem('username', res.data.name);
//       localStorage.setItem('department', res.data.department || 'Unknown Department');


//       alert(`Login successful as ${res.data.role}`);

//       onLogin();
//       if (res.data.role === 'admin') navigate('/admin-dashboard');
//       else if (res.data.role === 'staff') navigate('/staff-dashboard');
//       else navigate('/dashboard');
//     } catch (err) {
//       alert('Invalid credentials');
//     }
//   };


//   return (
//     <div
//       className="d-flex align-items-center justify-content-center vh-100"
//       style={{
//         backgroundImage: `url(${loginBackground})`,
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//         backgroundRepeat: 'no-repeat',
//       }}
//     >
//       <div
//         className="card shadow-lg p-4"
//         style={{ minWidth: '350px', maxWidth: '400px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
//       >
//         <h5 className="text-center mb-4">
//           <span className="text-primary">Project Office</span> &{' '}
//           <span className="text-primary">Computer Center</span> Management System
//         </h5>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label htmlFor="username" className="form-label">
//               Username
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="username"
//               placeholder="Enter username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//           </div>
//           <div className="mb-3">
//             <label htmlFor="password" className="form-label">
//               Password
//             </label>
//             <input
//               type="password"
//               className="form-control"
//               id="password"
//               placeholder="Enter password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <button type="submit" className="btn btn-primary w-100">
//             Sign In
//           </button>
//         </form>
//         <p className="text-center text-muted mt-4" style={{ fontSize: '0.8rem' }}>
//           © 2025 tbi@jec, Jyothi Engineering College. All rights reserved.
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;
