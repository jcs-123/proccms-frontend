import React, { useEffect, useState } from 'react';
import { Table, Modal, Spinner, Badge, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

function StaffAllBookings() {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const username = localStorage.getItem('name');

    useEffect(() => {
        fetchAllBookings();
    }, []);

    useEffect(() => {
        applyDateFilter();
    }, [fromDate, toDate, bookings]);

    const fetchAllBookings = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/room-booking/staff-all', {
                params: { username },
            });
            setBookings(response.data);
            setFilteredBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyDateFilter = () => {
        if (!fromDate && !toDate) {
            setFilteredBookings(bookings);
            return;
        }

        const filtered = bookings.filter(b => {
            const bookingDate = new Date(b.date);
            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;

            if (from && to) {
                return bookingDate >= from && bookingDate <= to;
            } else if (from) {
                return bookingDate >= from;
            } else if (to) {
                return bookingDate <= to;
            }
            return true;
        });

        setFilteredBookings(filtered);
    };

    const handleView = (booking) => {
        setSelectedBooking(booking);
        setShowModal(true);
    };

    const getRoleTag = (booking) => {
        if (booking.username === username && booking.assignedStaff === username) {
            return <Badge bg="primary">Requester & Assigned</Badge>;
        } else if (booking.username === username) {
            return <Badge bg="success">Requested</Badge>;
        } else if (booking.assignedStaff === username) {
            return <Badge bg="warning text-dark">Assigned</Badge>;
        }
        return null;
    };

    return (
        <div className="container mt-4 p-5">
            <h4 className="mb-4">My Room Bookings (Requested & Assigned)</h4>

            {/* From - To Date Filter */}
            <Row className="mb-4">
                <Col md={3}>
                    <Form.Label>From Date:</Form.Label>
                    <Form.Control
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </Col>
                <Col md={3}>
                    <Form.Label>To Date:</Form.Label>
                    <Form.Control
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </Col>
            </Row>

            {loading ? (
                <Spinner animation="border" />
            ) : filteredBookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Room</th>
                            <th>Purpose</th>
                            <th>Status</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map((booking) => (
                            <tr key={booking._id}>
                                <td>{booking.date}</td>
                                <td>{booking.timeFrom} - {booking.timeTo}</td>
                                <td>{booking.roomType}</td>
                                <td>{booking.purpose}</td>
                                <td>
                                    <Badge bg={
                                        booking.status === 'Booked' ? 'success' :
                                            booking.status === 'Cancelled' ? 'danger' :
                                                'warning text-dark'
                                    }>
                                        {booking.status}
                                    </Badge>
                                </td>
                                <td>{getRoleTag(booking)}</td>
                                <td>
                                    <button className="btn btn-info btn-sm" onClick={() => handleView(booking)}>
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Booking Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedBooking && (
                        <>
                            <p><strong>Room:</strong> {selectedBooking.roomType}</p>
                            <p><strong>Date:</strong> {selectedBooking.date}</p>
                            <p><strong>Time:</strong> {selectedBooking.timeFrom} - {selectedBooking.timeTo}</p>
                            <p><strong>Purpose:</strong> {selectedBooking.purpose}</p>
                            <p><strong>Status:</strong> {selectedBooking.status}</p>
                            <p><strong>Remarks:</strong> {selectedBooking.remarks}</p>
                            <p><strong>Requested By:</strong> {selectedBooking.username}</p>
                            <p><strong>Assigned Staff:</strong> {selectedBooking.assignedStaff || "None"}</p>

                            {/* ✅ Conditionally show Admin Remarks */}
                            {selectedBooking.adminRemarks && (
                                <div className="card mt-3">
                                    <div className="card-header bg-light">
                                        <strong>Admin Remarks</strong>
                                    </div>
                                    <div className="card-body">
                                        {selectedBooking.adminRemarks}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>

            </Modal>
        </div>
    );
}

export default StaffAllBookings;
