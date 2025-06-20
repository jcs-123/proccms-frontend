import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col, Form, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [repairRequests, setRepairRequests] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [repairDateFrom, setRepairDateFrom] = useState("");
  const [repairDateTo, setRepairDateTo] = useState("");
  const [bookingDateFrom, setBookingDateFrom] = useState("");
  const [bookingDateTo, setBookingDateTo] = useState("");

  const department = localStorage.getItem("department") || "N/A";
  const username = localStorage.getItem("name");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyRepairRequests();
    fetchMyRoomBookings();
  }, []);

  const fetchMyRepairRequests = async () => {
    try {
      const res = await axios.get('https://proccms-backend.onrender.com/api/repair-requests', {
        params: {
          role: "user",
          username,
          department,
          dateFrom: repairDateFrom,
          dateTo: repairDateTo,
        }
      });
      setRepairRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch repair requests", error);
    }
  };

  const fetchMyRoomBookings = async () => {
    try {
      const res = await axios.get('https://proccms-backend.onrender.com/api/room-booking', {
        params: {
          requestFrom: username,
          department
        }
      });

      const filtered = res.data.filter(item => {
        const created = new Date(item.createdAt);
        const from = bookingDateFrom ? new Date(bookingDateFrom) : null;
        const to = bookingDateTo ? new Date(bookingDateTo) : null;
        return (!from || created >= from) && (!to || created <= to);
      });

      setRoomBookings(filtered);
    } catch (error) {
      console.error("Failed to fetch room bookings", error);
    }
  };

  const renderStatusBadge = (status) => {
    const statusLower = status.toLowerCase();

    if (statusLower === 'assigned' || statusLower === 'cancelled' || statusLower === 'canceled') {
      return <Badge bg="danger">{status}</Badge>; // 🔴 red
    }

    if (statusLower === 'booked' || statusLower === 'completed') {
      return <Badge bg="success">{status}</Badge>; // 🟢 green
    }

    return <Badge bg="secondary">{status}</Badge>; // default
  };

  return (
    <Container className="pt-4 mt-3" fluid>
      <div className="bg-white p-4 shadow-sm rounded mb-4">
        <Row>
          <Col xs={12} className="d-flex justify-content-between align-items-center">
            <h4 className="fw-bold mb-0">User Dashboard</h4>
            <span className="fw-semibold text-muted">Department: {department}</span>
          </Col>
        </Row>
      </div>

      {/* Repair Requests Section */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="bg-white p-4 shadow-sm rounded">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Last 1 Month Repair Requests</h5>
              <div>
                <Button variant="success" className="me-2" onClick={() => navigate('/repair-request')}>
                  New Request
                </Button>
                <Button variant="primary" onClick={() => navigate('/my-repair-requests')}>
                  View All
                </Button>
              </div>
            </div>

            <Row className="mb-3">
              <Col md={3}>
                <Form.Control
                  type="date"
                  value={repairDateFrom}
                  onChange={(e) => setRepairDateFrom(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="date"
                  value={repairDateTo}
                  onChange={(e) => setRepairDateTo(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Button onClick={fetchMyRepairRequests}>Search</Button>
              </Col>
            </Row>

            <div className="table-responsive">
              <Table striped bordered hover size="sm">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Requested Date</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {repairRequests.length > 0 ? repairRequests.slice(0, 5).map((item, idx) => (
                    <tr key={item._id}>
                      <td>{idx + 1}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>{item.description}</td>
                      <td>{renderStatusBadge(item.status)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">No repair requests found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </Col>
      </Row>

      {/* Room Bookings Section */}
      <Row>
        <Col xs={12}>
          <div className="bg-white p-4 shadow-sm rounded">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Last 1 Month Room Bookings</h5>
              <div>
                <Button variant="success" className="me-2" onClick={() => navigate('/room-booking')}>
                  New Booking
                </Button>
                <Button variant="warning" onClick={() => navigate('/my-bookings')}>
                  View All
                </Button>
              </div>
            </div>

            <Row className="mb-3">
              <Col md={3}>
                <Form.Control
                  type="date"
                  value={bookingDateFrom}
                  onChange={(e) => setBookingDateFrom(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="date"
                  value={bookingDateTo}
                  onChange={(e) => setBookingDateTo(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Button onClick={fetchMyRoomBookings}>Search</Button>
              </Col>
            </Row>

            <div className="table-responsive">
              <Table striped bordered hover size="sm">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Booking Date</th>
                    <th>Purpose</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roomBookings.length > 0 ? roomBookings.slice(0, 5).map((item, idx) => (
                    <tr key={item._id}>
                      <td>{idx + 1}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>{item.purpose || "---"}</td>
                      <td>{renderStatusBadge(item.status)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">No room bookings found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;
