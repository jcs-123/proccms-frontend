import React, { useEffect, useState } from 'react';
import {
    Table, Button, Container, Row, Col, Badge,
} from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
    const [repairRequests, setRepairRequests] = useState([]);
    const [roomBookings, setRoomBookings] = useState([]);
    const department = localStorage.getItem("department") || "N/A";
    const username = localStorage.getItem("name");
    const navigate = useNavigate();

    useEffect(() => {
        fetchRepairRequests();
        fetchRoomBookings();
    }, []);

    const fetchRepairRequests = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/repair-requests?assignedTo=${username}`);
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            const recentAssigned = res.data.filter(item =>
                item.status !== "Completed" && new Date(item.createdAt) >= lastMonth
            );
            setRepairRequests(recentAssigned);
        } catch (error) {
            console.error("Failed to fetch repair requests", error);
        }
    };

    const fetchRoomBookings = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/room-booking/assigned?staff=${username}`);
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            const recentAssigned = res.data.filter(item =>
                new Date(item.createdAt) >= lastMonth
            );
            setRoomBookings(recentAssigned);
        } catch (error) {
            console.error("Failed to fetch room bookings", error);
        }
    };

    const renderStatusBadge = (status) => {
        const statusLower = status.toLowerCase();

        if (statusLower === "assigned") {
            return <Badge bg="warning" text="dark">Assigned</Badge>;
        }

        if (statusLower === "booked") {
            return <Badge bg="success">Booked</Badge>;
        }

        if (statusLower === "cancelled") {
            return <Badge bg="danger">Cancelled</Badge>; // red badge
        }

        return <Badge bg="secondary">{status}</Badge>;
    };


    const renderSection = (title, data, viewAllLink, isRepair = false) => (
        <Row className="mb-4">
            <Col xs={12}>
                <div className="bg-light p-4 shadow-sm rounded">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">{title}</h5>
                        <Button variant="warning" size="sm" onClick={() => navigate(viewAllLink)}>

                            View All
                        </Button>
                    </div>
                    <div className="table-responsive">
                        <Table striped bordered hover responsive size="sm" className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>{isRepair ? "Requested Date" : "Booking Date"}</th>
                                    <th>{isRepair ? "Requester" : "Booked By"}</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.slice(0, 5).map((item, idx) => (
                                        <tr key={item._id}>
                                            <td>{idx + 1}</td>
                                            <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                            <td>{item.username}, {item.department || '---'}</td>
                                            <td>{renderStatusBadge(item.status)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted">No data found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </Col>
        </Row>
    );

    return (
        <Container fluid className="pt-3 mt-4">
            <div className="bg-white p-4 shadow rounded mb-4">
                <Row>
                    <Col xs={12} className="d-flex justify-content-between align-items-center">
                        <h4 className="fw-bold">Staff Dashboard</h4>
                        <span className="text-muted fw-semibold">Department: {department}</span>
                    </Col>
                </Row>
            </div>

            {renderSection("Last 1 Month Assigned Repair Requests", repairRequests, "/staff/repair-requests", true)}
            {renderSection("Last 1 Month Assigned Room Bookings", roomBookings, "/assigned-bookings")}
        </Container>
    );
};

export default StaffDashboard;
