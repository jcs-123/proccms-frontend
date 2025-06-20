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

const AddStaff = () => {
    const [form, setForm] = useState({
        name: "",
        username: "",
        password: "",
        department: ""
    });



    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);
    const [staffList, setStaffList] = useState([]);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await axios.get("https://proccms-backend.onrender.com/api/staff");
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
            const res = await axios.post("https://proccms-backend.onrender.com/api/staff/add", form);
            setMessage(res.data.message);
            setError(false);
            setForm({ name: "", username: "", password: "", department: "" });
            fetchStaff(); // refresh list
        } catch (err) {
            setMessage(err.response?.data?.message || "Error occurred");
            setError(true);
        }
    };

    return (
        <Container maxWidth="md">
            <Paper elevation={4} sx={{ p: 4, mt: 7, borderRadius: 3 }}>
                <Typography variant="h4" gutterBottom align="center">
                    Add New Staff
                </Typography>

                {message && (
                    <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
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

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 3, py: 1.2, fontSize: "1rem" }}
                    >
                        Add Staff
                    </Button>
                </Box>
            </Paper>

            {/* Staff List Table */}
            <Paper elevation={3} sx={{ mt: 5, p: 3 }}>
                <Typography variant="h5" gutterBottom align="center">
                    Staff Members List
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
                            <TableRow>
                                <TableCell>SL No</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell>Password</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {staffList.map((staff, index) => (
                                <TableRow key={staff._id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{staff.name}</TableCell>
                                    <TableCell>{staff.username}</TableCell>
                                    <TableCell>{staff.password}</TableCell>
                                    <TableCell>{staff.department}</TableCell>
                                    <TableCell>{staff.email}</TableCell>
                                    <TableCell>{staff.phone}</TableCell>

                                </TableRow>
                            ))}
                            {staffList.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No staff members added yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default AddStaff;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//     Container,
//     TextField,
//     Button,
//     Typography,
//     Alert,
//     Box,
//     Paper,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
// } from "@mui/material";

// const AddStaff = () => {
//     const [form, setForm] = useState({
//         name: "",
//         username: "",
//         password: "",
//         department: "",
//         phone: "",
//         email: ""
//     });

//     const [message, setMessage] = useState("");
//     const [error, setError] = useState(false);
//     const [staffList, setStaffList] = useState([]);

//     useEffect(() => {
//         fetchStaff();
//     }, []);

//     const fetchStaff = async () => {
//         try {
//             const res = await axios.get("http://localhost:5000/api/staff");
//             setStaffList(res.data);
//         } catch (err) {
//             console.error("Failed to fetch staff:", err);
//         }
//     };

//     const handleChange = (e) => {
//         setForm({ ...form, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await axios.post("http://localhost:5000/api/staff/add", form);
//             setMessage(res.data.message);
//             setError(false);
//             setForm({
//                 name: "",
//                 username: "",
//                 password: "",
//                 department: "",
//                 phone: "",
//                 email: ""
//             });
//             fetchStaff(); // refresh list
//         } catch (err) {
//             setMessage(err.response?.data?.message || "Error occurred");
//             setError(true);
//         }
//     };

//     return (
//         <Container maxWidth="md">
//             <Paper elevation={4} sx={{ p: 4, mt: 7, borderRadius: 3 }}>
//                 <Typography variant="h4" gutterBottom align="center">
//                     Add New Staff
//                 </Typography>

//                 {message && (
//                     <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }}>
//                         {message}
//                     </Alert>
//                 )}

//                 <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
//                     <TextField
//                         label="Name"
//                         name="name"
//                         value={form.name}
//                         onChange={handleChange}
//                         fullWidth
//                         required
//                         margin="normal"
//                     />
//                     <TextField
//                         label="Username"
//                         name="username"
//                         value={form.username}
//                         onChange={handleChange}
//                         fullWidth
//                         required
//                         margin="normal"
//                     />
//                     <TextField
//                         label="Password"
//                         name="password"
//                         type="password"
//                         value={form.password}
//                         onChange={handleChange}
//                         fullWidth
//                         required
//                         margin="normal"
//                     />
//                     <TextField
//                         label="Department"
//                         name="department"
//                         value={form.department}
//                         onChange={handleChange}
//                         fullWidth
//                         required
//                         margin="normal"
//                     />
//                     <TextField
//                         label="Phone"
//                         name="phone"
//                         value={form.phone}
//                         onChange={handleChange}
//                         fullWidth
//                         required
//                         margin="normal"
//                     />
//                     <TextField
//                         label="Email"
//                         name="email"
//                         type="email"
//                         value={form.email}
//                         onChange={handleChange}
//                         fullWidth
//                         required
//                         margin="normal"
//                     />
//                     <Button
//                         type="submit"
//                         variant="contained"
//                         fullWidth
//                         sx={{ mt: 3, py: 1.2, fontSize: "1rem" }}
//                     >
//                         Add Staff
//                     </Button>
//                 </Box>
//             </Paper>

//             {/* Staff List Table */}
//             <Paper elevation={3} sx={{ mt: 5, p: 3 }}>
//                 <Typography variant="h5" gutterBottom align="center">
//                     Staff Members List
//                 </Typography>
//                 <TableContainer>
//                     <Table>
//                         <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
//                             <TableRow>
//                                 <TableCell>SL No</TableCell>
//                                 <TableCell>Name</TableCell>
//                                 <TableCell>Username</TableCell>
//                                 <TableCell>Password</TableCell>
//                                 <TableCell>Department</TableCell>
//                                 <TableCell>Phone</TableCell>
//                                 <TableCell>Email</TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {staffList.length > 0 ? (
//                                 staffList.map((staff, index) => (
//                                     <TableRow key={staff._id}>
//                                         <TableCell>{index + 1}</TableCell>
//                                         <TableCell>{staff.name}</TableCell>
//                                         <TableCell>{staff.username}</TableCell>
//                                         <TableCell>{staff.password}</TableCell>
//                                         <TableCell>{staff.department}</TableCell>
//                                         <TableCell>{staff.phone}</TableCell>
//                                         <TableCell>{staff.email}</TableCell>
//                                     </TableRow>
//                                 ))
//                             ) : (
//                                 <TableRow>
//                                     <TableCell colSpan={7} align="center">
//                                         No staff members added yet.
//                                     </TableCell>
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//             </Paper>
//         </Container>
//     );
// };

// export default AddStaff;
