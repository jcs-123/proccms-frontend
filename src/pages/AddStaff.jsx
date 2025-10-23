import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { motion } from "framer-motion";

const AddStaff = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    department: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get(
        "https://proccms-backend.onrender.com/api/staff"
      );
      setStaffList(res.data);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://proccms-backend.onrender.com/api/staff/add",
        form
      );
      setMessage(res.data.message);
      setError(false);
      setForm({
        name: "",
        username: "",
        password: "",
        department: "",
        email: "",
        phone: "",
      });
      fetchStaff();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error occurred");
      setError(true);
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 5,
      }}
    >
      {/* Animated Form Section */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <Paper
          elevation={5}
          sx={{
            p: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #eef2f3, #ffffff)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "#0B2154",
              mb: 2,
              letterSpacing: 0.5,
            }}
          >
            Add New Staff
          </Typography>

          {message && (
            <Alert
              severity={error ? "error" : "success"}
              sx={{
                mb: 2,
                borderRadius: 2,
                fontWeight: 500,
              }}
            >
              {message}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            autoComplete="off"
            sx={{ mt: 1 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    py: 1.2,
                    fontSize: "1rem",
                    background:
                      "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
                    fontWeight: 600,
                    color: "#fff",
                    borderRadius: 3,
                    textTransform: "none",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                    },
                  }}
                >
                  Add Staff
                </Button>
              </motion.div>
            </motion.div>
          </Box>
        </Paper>
      </motion.div>

      {/* Animated Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Paper
          elevation={3}
          sx={{
            mt: 6,
            p: 3,
            borderRadius: 3,
            background: "#ffffff",
          }}
        >
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: 600, color: "#1e293b" }}
          >
            Staff Members List
          </Typography>
          <TableContainer>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "#f8fafc",
                }}
              >
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>SL No</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Password</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffList.length > 0 ? (
                  staffList.map((staff, index) => (
                    <motion.tr
                      key={staff._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#f9fafb" : "#ffffff",
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{staff.name}</TableCell>
                      <TableCell>{staff.username}</TableCell>
                      <TableCell>{staff.password}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>{staff.phone}</TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No staff members added yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default AddStaff;
