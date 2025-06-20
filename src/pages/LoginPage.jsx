import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import loginBackground from '../assets/login.jpg';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('https://proccms-backend.onrender.com/api/auth/login', {
        username,
        password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', res.data.username);  // ✅ correct
      localStorage.setItem('name', res.data.name);          // ✅ for display
      localStorage.setItem('department', res.data.department || 'Unknown Department');
      localStorage.setItem('email', res.data.email || '');
      localStorage.setItem('phone', res.data.phone || '');

      // ✅ Show toast and delay navigation
      toast.success(`Login successful as ${res.data.role}`, {
        position: 'top-center',
        autoClose: 1000, // Toast visible for 2.5 seconds
        onClose: () => {
          // ✅ Navigate after toast closes
          onLogin(); // Optional state update
          if (res.data.role === 'admin') navigate('/admin-dashboard');
          else if (res.data.role === 'staff') navigate('/staff-dashboard');
          else navigate('/dashboard');
        },
      });
    } catch (err) {
      toast.error('Invalid credentials. Please try again.', {
        position: 'top-center',
        autoClose: 1000,
      });
    }
  };


  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        padding: '1rem',
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          boxSizing: 'border-box',
        }}
      >
        <h5 className="text-center mb-4 fw-bold text-primary" style={{ letterSpacing: '0.05em' }}>
          Project Office Management System
        </h5>
        <form onSubmit={handleSubmit}>

          <div className="mb-3 position-relative">
            <label htmlFor="username" className="form-label fw-semibold">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            {/* Show tick icon if username is not empty */}
            {username.trim() !== '' && (
              <span
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '70%',
                  transform: 'translateY(-50%)',
                  color: 'green',
                  pointerEvents: 'none',
                }}
                aria-label="Username entered"
                title="Looks good!"
              >
                {/* Tick SVG icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="green"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>

              </span>
            )}
          </div>


          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control pe-5"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                top: '70%',
                right: '12px',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#6c757d',
                userSelect: 'none',
              }}
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                  <path d="M13.359 11.238l1.58 1.58a.5.5 0 0 1-.708.708l-1.58-1.58a8.986 8.986 0 0 1-3.65 1.508.5.5 0 0 1-.305-.06c-.196-.104-.32-.315-.305-.56l.001-.001a.5.5 0 0 1 .055-.176l1.313-2.626a.5.5 0 0 1 .58-.24c.615.19 1.251.28 1.897.28a.5.5 0 0 1 0 1 8.12 8.12 0 0 0 1.208-.06zm-10.22-6.095 1.58-1.58a.5.5 0 0 1 .708.708l-1.58 1.58A8.99 8.99 0 0 1 8 4c1.815 0 3.568.665 4.902 1.87l1.581-1.581a.5.5 0 0 1 .708.708l-1.581 1.581a8.987 8.987 0 0 1 1.408 2.14l1.386-1.387a.5.5 0 0 1 .708.708l-1.386 1.386a8.987 8.987 0 0 1-2.149 1.408l1.581 1.581a.5.5 0 0 1-.708.708l-1.581-1.58A8.99 8.99 0 0 1 8 12a8.99 8.99 0 0 1-4.902-1.871l-1.58 1.58a.5.5 0 0 1-.708-.708l1.58-1.58A8.987 8.987 0 0 1 3 8c0-.796.145-1.56.415-2.27z" />
                  <path d="M11.5 8a3.5 3.5 0 1 0-7 0 3.5 3.5 0 0 0 7 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8z" />
                  <path d="M8 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                </svg>
              )}
            </span>
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-semibold">
            Sign In
          </button>
        </form>

        <p
          className="text-center text-muted mt-4"
          style={{ fontSize: '0.8rem', userSelect: 'none' }}
        >
          © 2025 tbi@jec, Jyothi Engineering College. All rights reserved.
        </p>
      </div>
      <ToastContainer position="top-center" autoClose={2500} />
    </div>
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
