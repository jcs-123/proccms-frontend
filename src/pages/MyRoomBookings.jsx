import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Row, Col, InputGroup, Modal, Container } from 'react-bootstrap';
import axios from 'axios';
import './RoomBookingList.css';


function UserRoomBookingList() {
  const [filters, setFilters] = useState({
    bookingFrom: '',
    bookingTo: '',
    status: '',
    roomType: '',
    search: '',
  });

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewModalShow, setViewModalShow] = useState(false);
  const [remarksModalShow, setRemarksModalShow] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [remarks, setRemarks] = useState('');

  // ✅ Get current user info (assumes it's stored in localStorage after login)
  const currentUsername = localStorage.getItem('name');
  const currentDepartment = localStorage.getItem('department');


  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://proccms-backend.onrender.com/api/room-booking');

      // Filter bookings for the logged-in user only
      const userBookings = response.data.filter(booking => {
        const bookingUsername = booking.requestFrom?.username || booking.username || '';
        const bookingDepartment = booking.requestFrom?.department || booking.department || '';

        return bookingUsername === currentUsername && bookingDepartment === currentDepartment;
      });

      setBookings(userBookings);
      setError(null);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchBookings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openViewModal = (booking) => {
    setSelectedBooking(booking);
    setViewModalShow(true);
  };

  const openRemarksModal = (booking) => {
    setSelectedBooking(booking);
    setRemarks('');
    setRemarksModalShow(true);
  };

  const saveRemarks = async () => {
    if (!remarks.trim()) {
      alert('Please enter remarks before saving.');
      return;
    }
    try {
      // Send remarks to backend API as admin remarks
      await axios.post(`https://proccms-backend.onrender.com/api/room-booking/${selectedBooking._id}/user-remarks`, {
        remarks,
      });
      alert('user remarks saved successfully!');
      setRemarksModalShow(false);
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Failed to save user remarks', error);
      alert('Failed to save admin remarks. Please try again.');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = booking.date || booking.bookingDateTime?.slice(0, 10);
    if (filters.bookingFrom && bookingDate < filters.bookingFrom) return false;
    if (filters.bookingTo && bookingDate > filters.bookingTo) return false;

    if (filters.status && (booking.status || 'Pending') !== filters.status) return false;

    if (filters.roomType && filters.roomType !== '') {
      if (filters.roomType === 'OTHER (Enter Remarks)') {
        if (
          booking.room !== 'OTHER (Enter Remarks)' &&
          booking.roomType !== 'OTHER (Enter Remarks)'
        )
          return false;
      } else if (
        booking.room !== filters.roomType &&
        booking.roomType !== filters.roomType
      )
        return false;
    }

    const searchLower = filters.search.toLowerCase();
    if (filters.search.trim() !== '') {
      const username = booking.requestFrom?.username || booking.username || '';
      const department = booking.requestFrom?.department || booking.department || '';
      const mobile = booking.requestFrom?.mobile || booking.mobileNumber || '';
      if (
        !username.toLowerCase().includes(searchLower) &&
        !department.toLowerCase().includes(searchLower) &&
        !mobile.toLowerCase().includes(searchLower)
      )
        return false;
    }

    return true;
  });

  if (loading)
    return (
      <Container className="p-5">
        <p>Loading bookings...</p>
      </Container>
    );

  if (error)
    return (
      <Container className="p-5">
        <p className="text-danger">{error}</p>
      </Container>
    );

  return (
    <Container className="p-5 bg-white rounded shadow-sm mt-4" style={{ maxWidth: '1200px' }}>
      <h5 className="mb-4" style={{ color: 'black' }}>
        My Room Booking List
      </h5>

      {/* Filter Form */}
      <Form className="mb-4">
        <Row className="g-3">
          <Col md={3}>
            <Form.Label className="fw-bold mt-4">Booking Date from</Form.Label>
            <InputGroup>
              <Form.Control type="date" name="bookingFrom" value={filters.bookingFrom} onChange={handleChange} />
              <InputGroup.Text><i className="bi bi-calendar3"></i></InputGroup.Text>
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold mt-4">Booking Date to</Form.Label>
            <InputGroup>
              <Form.Control type="date" name="bookingTo" value={filters.bookingTo} onChange={handleChange} />
              <InputGroup.Text><i className="bi bi-calendar3"></i></InputGroup.Text>
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold mt-4">Status</Form.Label>
            <Form.Select name="status" value={filters.status} onChange={handleChange}>
              <option value="">--- All ---</option>
              <option value="Booked">Booked</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold mt-4">Room Type</Form.Label>
            <Form.Select name="roomType" value={filters.roomType} onChange={handleChange}>
              <option value="">--- select ---</option>
              <option>Auditorium</option>
              <option>Decennial</option>
              <option>Insight</option>
              <option>415/416</option>
              <option>Guest Room</option>
              <option>Main Dinning Hall</option>
              <option>Dinning Hall Near Decennial</option>
              <option>OTHER (Enter Remarks)</option>
            </Form.Select>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={3}>
            <Form.Control
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search by user, dept or mobile"
            />
          </Col>
          <Col md={2}>
            <Button variant="primary" className="w-100" onClick={fetchBookings}>
              Search
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Table */}
      <div className="table-responsive">
        <Table striped bordered hover size="sm" responsive>
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Requested Date</th>
              <th>Booking Date & Time</th>
              <th>Room</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No records found.</td>
              </tr>
            ) : (
              filteredBookings.map((booking, index) => (
                <tr key={booking._id}>
                  <td>{index + 1}</td>
                  <td>{booking.requestedDate || booking.createdAt?.slice(0, 10)}</td>
                  <td>{booking.bookingDateTime || `${booking.date || ''} – ${booking.timeFrom || ''} to ${booking.timeTo || ''}`}</td>
                  <td>{booking.room || booking.roomType}</td>
                  <td>
                    <span className={
                      (booking.status || 'Pending') === 'Booked'
                        ? 'badge bg-success'
                        : (booking.status || 'Pending') === 'Pending'
                          ? 'badge bg-warning text-dark'
                          : 'badge bg-danger'
                    }>
                      {booking.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <Button variant="primary" size="sm" className="me-2" onClick={() => openViewModal(booking)}>
                      View
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => openRemarksModal(booking)}>
                      Remarks
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* View Modal */}
      <Modal show={viewModalShow} onHide={() => setViewModalShow(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking ? (
            <div className="row g-3">
              <div className="col-md-6">
                <p><strong>Booking Date:</strong> {selectedBooking.date || selectedBooking.bookingDateTime?.slice(0, 10)}</p>
                <p><strong>Time Slot:</strong> {selectedBooking.timeFrom} - {selectedBooking.timeTo}</p>
                <p><strong>Room:</strong> {selectedBooking.room || selectedBooking.roomType}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Status:</strong>
                  <span className={`badge ${selectedBooking.status === 'Booked' ? 'bg-success' : selectedBooking.status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                    {selectedBooking.status || 'Pending'}
                  </span>
                </p>
                <p><strong>Requested By:</strong> {selectedBooking.requestFrom?.username || selectedBooking.username}</p>
              </div>

              {/* Admin Remarks Section */}
              <div className="col-md-6 mt-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">Admin Remarks</h6>
                  </div>
                  <div className="card-body">
                    {selectedBooking.adminRemarks ? (
                      <div className="p-2 bg-white rounded border">
                        {selectedBooking.adminRemarks}
                      </div>
                    ) : (
                      <p className="text-muted mb-0">No remarks from admin</p>
                    )}
                  </div>
                </div>
              </div>

              {/* User Remarks Section */}
              <div className="col-md-6 mt-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">User Remarks</h6>
                  </div>
                  <div className="card-body">
                    {selectedBooking.userRemarks ? (
                      <div className="p-2 bg-white rounded border">
                        {selectedBooking.userRemarks}
                      </div>
                    ) : (
                      <p className="text-muted mb-0">No remarks from user</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>No booking selected.</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewModalShow(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Remarks Modal */}
      <Modal show={remarksModalShow} onHide={() => setRemarksModalShow(false)} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Remarks</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Enter your remarks here"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRemarksModalShow(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveRemarks}>Save Remarks</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default UserRoomBookingList;
