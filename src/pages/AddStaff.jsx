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
  IconButton,
  Chip,
  Card,
  CardContent,
  Grid,
  Fade,
  Zoom,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "https://proccms-backend.onrender.com/api/staff";

const AddStaff = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    department: "",
    email: "",
    phone: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get(API_URL);
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
    setIsSubmitting(true);

    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/${editingId}`, form);
        setMessage(res.data.message);
        setError(false);
        setEditingId(null);
      } else {
        const res = await axios.post(`${API_URL}/add`, form);
        setMessage(res.data.message);
        setError(false);
      }

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (staff) => {
    setForm({
      name: staff.name,
      username: staff.username,
      password: staff.password,
      department: staff.department,
      email: staff.email,
      phone: staff.phone,
    });
    setEditingId(staff._id);
    setMessage("");
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDepartmentColor = (dept) => {
    const colors = {
      IT: "#0ea5e9",
      HR: "#10b981",
      Finance: "#f59e0b",
      Marketing: "#8b5cf6",
      Sales: "#ef4444",
      Operations: "#06b6d4",
    };
    return colors[dept] || "#6b7280";
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header Stats */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: 4,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <GroupIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {staffList.length}
                </Typography>
                <Typography variant="h6">
                  Total Staff
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 4, height: "100%" }}>
              <CardContent sx={{ py: 3, textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                  Staff Management
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {editingId ? "Edit Staff Member" : "Add New Staff Member"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Form Section */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            border: "1px solid #e2e8f0",
            mb: 6,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <PersonAddIcon 
              sx={{ 
                fontSize: 32, 
                color: "#0ea5e9", 
                mr: 2 
              }} 
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {editingId ? "Edit Staff" : "Add New Staff"}
            </Typography>
          </Box>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert
                  severity={error ? "error" : "success"}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    fontWeight: 500,
                    fontSize: "1rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  {message}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: "white",
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: "white",
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: "white",
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: "white",
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: "white",
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: "white",
                    }
                  }}
                />
              </Grid>
            </Grid>

            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              style={{ marginTop: 32 }}
            >
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  fontSize: "1.1rem",
                  background: editingId 
                    ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                    : "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
                  fontWeight: 600,
                  color: "#fff",
                  borderRadius: 3,
                  textTransform: "none",
                  boxShadow: "0 8px 25px rgba(14, 165, 233, 0.3)",
                  "&:hover": {
                    boxShadow: "0 12px 35px rgba(14, 165, 233, 0.4)",
                    background: editingId 
                      ? "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
                      : "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                  },
                  "&:disabled": {
                    background: "#94a3b8",
                    boxShadow: "none",
                  }
                }}
              >
                {isSubmitting ? "Processing..." : editingId ? "Update Staff Member" : "Add Staff Member"}
              </Button>
            </motion.div>

            {editingId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ marginTop: 16 }}
              >
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      name: "",
                      username: "",
                      password: "",
                      department: "",
                      email: "",
                      phone: "",
                    });
                  }}
                  sx={{
                    py: 1.2,
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  Cancel Edit
                </Button>
              </motion.div>
            )}
          </Box>
        </Paper>
      </motion.div>

      {/* Staff List Section */}
     {/* Staff List Section */}
<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.4 }}
>
  <Paper 
    elevation={6} 
    sx={{ 
      p: 4, 
      borderRadius: 4, 
      background: "white",
      border: "1px solid #e2e8f0",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
      <GroupIcon sx={{ fontSize: 32, color: "#0ea5e9", mr: 2 }} />
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: "bold",
          background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        Staff Members ({staffList.length})
      </Typography>
    </Box>

    <TableContainer 
      component={Paper} 
      elevation={2}
      sx={{ 
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f8fafc" }}>
            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", py: 2 }}>#</TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", py: 2 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", py: 2 }}>Username</TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", py: 2 }}>Password</TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", py: 2 }}>Department</TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", py: 2 }}>Contact</TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", py: 2 }} align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <AnimatePresence>
            {staffList.length > 0 ? (
              staffList.map((staff, index) => (
                <motion.tr
                  key={staff._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f9fafb" : "#ffffff",
                  }}
                >
                  <TableCell sx={{ py: 2, fontWeight: "medium" }}>
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body1" fontWeight="500">
                      {staff.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      @{staff.username}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace',
                        backgroundColor: '#f1f5f9',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}
                    >
                      {staff.password}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={staff.department}
                      size="small"
                      sx={{
                        backgroundColor: getDepartmentColor(staff.department),
                        color: "white",
                        fontWeight: "500",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {staff.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {staff.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                      <IconButton 
                        onClick={() => handleEdit(staff)}
                        sx={{
                          backgroundColor: "#0ea5e9",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "#0284c7",
                            transform: "scale(1.1)",
                          },
                          transition: "all 0.2s",
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Zoom>
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="h6" color="text.secondary">
                    No staff members found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Add your first staff member using the form above
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
</motion.div>
    </Container>
  );
};

export default AddStaff;