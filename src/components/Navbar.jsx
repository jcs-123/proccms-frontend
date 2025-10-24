import React, { useState } from "react";
import { FaSignOutAlt, FaKey } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

const Navbar = ({ onLogout }) => {
  const userName = localStorage.getItem("name") || "User";
  const username = localStorage.getItem("username");

  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setResetMessage("❌ All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetMessage("❌ Passwords do not match");
      return;
    }

    try {
      const res = await fetch(
        "https://proccms-backend.onrender.com/api/auth/reset-password",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password: newPassword }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setResetMessage("✅ Password updated successfully");
        setTimeout(() => {
          setShowModal(false);
          setNewPassword("");
          setConfirmPassword("");
          setResetMessage("");
        }, 1500);
      } else {
        setResetMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setResetMessage("❌ Failed to update password");
    }
  };

  return (
    <>
      {/* Navbar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={styles.navbar}
      >
        <div style={styles.left}>
          <motion.img
            src={logo}
            alt="Logo"
            style={styles.logo}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
        </div>

        <motion.div
          className="navbar-right"
          style={styles.right}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span style={styles.username} className="username">
            {userName.toUpperCase()}
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="resetBtn"
            style={styles.resetBtn}
            onClick={() => setShowModal(true)}
          >
            <FaKey style={{ marginRight: 5 }} /> Reset Password
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="signOutBtn"
            style={styles.signOutBtn}
            onClick={onLogout}
          >
            <FaSignOutAlt style={{ marginRight: 5 }} /> Sign Out
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Modal with animation */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={styles.modal}
              initial={{ scale: 0.8, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h3
                style={{
                  marginBottom: 10,
                  color: "#0b2154",
                  fontWeight: "600",
                }}
              >
                Reset Password
              </h3>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
              />
              {resetMessage && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    color: resetMessage.startsWith("✅") ? "green" : "red",
                    fontSize: "0.85rem",
                    marginTop: 4,
                  }}
                >
                  {resetMessage}
                </motion.p>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 14,
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleResetPassword}
                  style={styles.modalBtn}
                >
                  Update
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive CSS */}
      <style>
        {`
        @media (max-width: 768px) {
          .navbar-right {
            gap: 10px;
          }
          .username {
            font-size: 0.85rem;
          }
          .resetBtn, .signOutBtn {
            padding: 5px 10px;
            font-size: 0.8rem;
          }
        }
        @media (max-width: 500px) {
          .navbar-right {
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;
          }
          .username {
            display: none;
          }
          .resetBtn, .signOutBtn {
            width: 100%;
            font-size: 0.8rem;
            padding: 6px;
          }
        }
      `}
      </style>
    </>
  );
};

// Styles
const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "70px",
    width: "100%",
    background: "linear-gradient(90deg, #00dedc, #4a6dfd)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 25px",
    zIndex: 1000,
    color: "white",
    boxShadow: "0px 3px 8px rgba(0,0,0,0.15)",
    flexWrap: "wrap",
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    height: "52px",
    objectFit: "contain",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  username: {
    fontWeight: "bold",
    fontSize: "0.95rem",
    whiteSpace: "nowrap",
    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
  },
  resetBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },
  signOutBtn: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)",
    display: "flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.3s",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "10px",
    width: "300px",
    textAlign: "center",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
  },
  input: {
    width: "100%",
    margin: "10px 0",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  modalBtn: {
    background: "#2563eb",
    color: "#fff",
    padding: "6px 14px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  cancelBtn: {
    background: "#999",
    color: "#fff",
    padding: "6px 14px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Navbar;



// import React, { useState } from 'react';
// import { FaSignOutAlt } from 'react-icons/fa';
// import logo from '../assets/logo.png';

// const Navbar = ({ onLogout }) => {
//   const userName = localStorage.getItem('name') || 'User';
//   const username = localStorage.getItem('username');

//   const [showModal, setShowModal] = useState(false);
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [resetMessage, setResetMessage] = useState('');

//   const handleResetPassword = async () => {
//     if (!newPassword || !confirmPassword) {
//       setResetMessage('❌ All fields are required');
//       return;
//     }
//     if (newPassword !== confirmPassword) {
//       setResetMessage('❌ Passwords do not match');
//       return;
//     }

//     try {
//       const res = await fetch('https://proccms-backend.onrender.com/api/auth/reset-password', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password: newPassword }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         setResetMessage('✅ Password updated successfully');
//         setTimeout(() => {
//           setShowModal(false);
//           setNewPassword('');
//           setConfirmPassword('');
//           setResetMessage('');
//         }, 1500);
//       } else {
//         setResetMessage(`❌ ${data.message}`);
//       }
//     } catch (err) {
//       setResetMessage('❌ Failed to update password');
//     }
//   };

//   return (
//     <div style={styles.navbar}>
//       <div style={styles.left}>
//         <img src={logo} alt="Logo" style={styles.logo} />
//       </div>
//       <div style={styles.right} className="navbar-right">
//         <span style={styles.username} className="username">
//           {userName.toUpperCase()}
//         </span>
//         <button style={styles.resetBtn} onClick={() => setShowModal(true)} className="resetBtn">
//           Reset Password
//         </button>
//         <button style={styles.signOutBtn} onClick={onLogout} className="signOutBtn">
//           <FaSignOutAlt style={{ marginRight: '5px' }} />
//           Sign Out
//         </button>
//       </div>

//       {/* Password Reset Modal */}
//       {showModal && (
//         <div style={styles.modalOverlay}>
//           <div style={styles.modal}>
//             <h3>Reset Password</h3>
//             <input
//               type="password"
//               placeholder="New Password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               style={styles.input}
//             />
//             <input
//               type="password"
//               placeholder="Confirm Password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               style={styles.input}
//             />
//             {resetMessage && (
//               <p style={{ color: resetMessage.startsWith('✅') ? 'green' : 'red', fontSize: '0.85rem' }}>
//                 {resetMessage}
//               </p>
//             )}
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
//               <button onClick={handleResetPassword} style={styles.modalBtn}>
//                 Update
//               </button>
//               <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Responsive Styles */}
//       <style>
//         {`
//           @media (max-width: 768px) {
//             .navbar-right {
//               gap: 8px;
//             }
//             .username {
//               font-size: 0.85rem;
//             }
//             .resetBtn {
//               padding: 5px 10px;
//               font-size: 0.75rem;
//             }
//             .signOutBtn {
//               font-size: 0.75rem;
//             }
//           }

//           @media (max-width: 480px) {
//             .navbar-right {
//               flex-direction: column;
//               align-items: flex-end;
//               gap: 6px;
//             }
//             .username {
//               display: none;
//             }
//             .resetBtn, .signOutBtn {
//               width: 100%;
//               font-size: 0.75rem;
//               padding: 6px;
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// const styles = {
//   navbar: {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     height: '70px',
//     width: '100%',
//     background: 'linear-gradient(to right, #00dedc, #4a6dfd)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: '0 25px',
//     zIndex: 1000,
//     color: 'white',
//     boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
//     flexWrap: 'wrap',
//   },
//   left: {
//     display: 'flex',
//     alignItems: 'center',
//   },
//   logo: {
//     height: '55px',
//   },
//   right: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '15px',
//   },
//   username: {
//     fontWeight: 'bold',
//     fontSize: '0.95rem',
//     whiteSpace: 'nowrap',
//   },
//   resetBtn: {
//     background: '#257AFD',
//     color: '#fff',
//     border: 'none',
//     padding: '6px 14px',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     fontWeight: '500',
//   },
//   signOutBtn: {
//     background: 'transparent',
//     color: '#fff',
//     border: 'none',
//     display: 'flex',
//     alignItems: 'center',
//     cursor: 'pointer',
//     fontWeight: '500',
//   },
//   modalOverlay: {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     width: '100%',
//     height: '100%',
//     background: 'rgba(0,0,0,0.5)',
//     zIndex: 2000,
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   modal: {
//     background: 'white',
//     padding: '25px',
//     borderRadius: '8px',
//     width: '300px',
//     textAlign: 'center',
//   },
//   input: {
//     width: '100%',
//     margin: '10px 0',
//     padding: '8px',
//     border: '1px solid #ccc',
//     borderRadius: '4px',
//   },
//   modalBtn: {
//     background: '#257AFD',
//     color: '#fff',
//     padding: '6px 14px',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//   },
//   cancelBtn: {
//     background: '#aaa',
//     color: '#fff',
//     padding: '6px 14px',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//   },
// };

// export default Navbar;
