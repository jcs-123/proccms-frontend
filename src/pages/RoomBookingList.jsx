import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Row, Col, InputGroup, Modal, Container } from 'react-bootstrap';
import axios from 'axios';
import './RoomBookingList.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


function RoomBookingList() {
  const [filters, setFilters] = useState({
    bookingFrom: '',
    bookingTo: '',
    status: '',
    roomType: '',
    search: '',
  });


  const exportToExcel = (data) => {
    // Prepare worksheet from JSON
    const ws = XLSX.utils.json_to_sheet(data);

    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");

    // Generate binary and convert to blob
    const wbout = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array"
    });
    const blob = new Blob([wbout], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    // Trigger download
    saveAs(blob, "RoomBookings.xlsx");
  };


  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewModalShow, setViewModalShow] = useState(false);
  const [remarksModalShow, setRemarksModalShow] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [remarks, setRemarks] = useState('');

  // Fetch bookings from backend on component mount or reload
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/room-booking');
      setBookings(response.data);
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
      await axios.post(`http://localhost:5000/api/room-booking/${selectedBooking._id}/admin-remarks`, {
        remarks,
      });
      alert('Admin remarks saved successfully!');
      setRemarksModalShow(false);
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Failed to save admin remarks', error);
      alert('Failed to save admin remarks. Please try again.');
    }
  };


  // Filter logic
  const filteredBookings = bookings.filter(booking => {
    // Filter by bookingFrom and bookingTo (date range)
    const bookingDate = booking.date || booking.bookingDateTime?.slice(0, 10);
    if (filters.bookingFrom && bookingDate < filters.bookingFrom) return false;
    if (filters.bookingTo && bookingDate > filters.bookingTo) return false;

    // Filter by status
    if (filters.status && (booking.status || 'Pending') !== filters.status) return false;

    // Filter by roomType
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

    // Filter by search (requestFrom username, department, mobile)
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
      <a href="/booking-calender" className="text-decoration-none text-primary d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-calendar3"></i>
        <h5 className="mb-0">View Booking Calendar</h5>
      </a>

      <h6 className="mb-4" style={{ color: 'black' }}>
        Room Booking List
      </h6>

      <Form className="mb-4">
        <Row className="g-3">
          <Col md={3}>
            <Form.Label className="fw-bold mt-4">Booking Date from</Form.Label>
            <InputGroup>
              <Form.Control type="date" name="bookingFrom" value={filters.bookingFrom} onChange={handleChange} />
              <InputGroup.Text>
                <i className="bi bi-calendar3"></i>
              </InputGroup.Text>
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold mt-4">Booking Date to</Form.Label>
            <InputGroup>
              <Form.Control type="date" name="bookingTo" value={filters.bookingTo} onChange={handleChange} />
              <InputGroup.Text>
                <i className="bi bi-calendar3"></i>
              </InputGroup.Text>
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
          <Col md={3}>
            <Button
              variant="success"
              className="w-100"
              onClick={() => exportToExcel(filteredBookings)}
            >
              Download Excel
            </Button>
          </Col>

        </Row>
      </Form>

      <div className="table-responsive">
        <Table striped bordered hover size="sm" responsive>
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Requested Date</th>
              <th>Request From</th>
              <th>Booking Date & Time</th>
              <th>Room</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No records found.
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking, index) => (
                <tr key={booking._id || booking.id}>
                  <td>{index + 1}</td>
                  <td>{booking.requestedDate || booking.createdAt?.slice(0, 10) || '—'}</td>
                  <td>
                    <div>
                      <strong>{booking.requestFrom?.username || booking.username || '—'}</strong>
                    </div>
                    <div className="text-muted">Dept: {booking.requestFrom?.department || booking.department || '—'}</div>
                    <div className="text-muted">Mob: {booking.requestFrom?.mobile || booking.mobileNumber || '—'}</div>
                  </td>

                  <td>{booking.bookingDateTime || `${booking.date || ''} – ${booking.timeFrom || ''} to ${booking.timeTo || ''}`}</td>
                  <td>{booking.room || booking.roomType || '—'}</td>

                  <td>
                    <span
                      className={
                        (booking.status || 'Pending') === 'Booked'
                          ? 'badge bg-success'
                          : (booking.status || 'Pending') === 'Pending'
                            ? 'badge bg-warning text-dark'
                            : (booking.status || 'Pending') === 'Cancelled'
                              ? 'badge bg-danger'
                              : 'badge bg-secondary'
                      }
                    >
                      {booking.status || 'Pending'}
                    </span>
                  </td>

                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openViewModal(booking)}
                      className="me-2"
                    >
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
      <Modal
        show={viewModalShow}
        onHide={() => setViewModalShow(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Room Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking ? (
            <div className="border p-3 rounded" style={{ fontSize: '14px' }}>
              {/* Header Info */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Booking No:</strong> #{selectedBooking.bookingNumber || selectedBooking._id?.slice(-4)}
                  </div>
                  <div className="d-flex gap-2">
                    <span className={`badge bg-${selectedBooking.status === 'Cancelled' ? 'danger' : selectedBooking.status === 'Booked' ? 'success' : 'warning text-dark'}`}>
                      Booking Status: {selectedBooking.status || 'Pending'}
                    </span>
                    {selectedBooking.approvedBy && (
                      <span className="badge bg-info text-dark">Approved By: {selectedBooking.approvedBy}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* User Details */}
              <h6 className="mt-3 mb-2 text-primary">User Information</h6>
              <table className="table table-sm table-bordered">
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td>{selectedBooking.requestFrom?.username || selectedBooking.username}</td>
                    <th>Department</th>
                    <td>{selectedBooking.requestFrom?.department || selectedBooking.department}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{selectedBooking.requestFrom?.email || selectedBooking.email || '--'}</td>
                    <th>Mobile</th>
                    <td>{selectedBooking.requestFrom?.mobile || selectedBooking.mobileNumber || '--'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Booking Details */}
              <h6 className="mt-4 mb-2 text-primary">Booking Details</h6>
              <table className="table table-sm table-bordered">
                <tbody>
                  <tr>
                    <th>Requested Date</th>
                    <td>{selectedBooking.requestedDate || selectedBooking.createdAt?.slice(0, 10)}</td>
                    <th>Requested Room</th>
                    <td>{selectedBooking.room || selectedBooking.roomType}</td>
                  </tr>
                  <tr>
                    <th>Booking Date & Time</th>
                    <td colSpan="3">
                      {selectedBooking.bookingDateTime || `${selectedBooking.date} - ${selectedBooking.timeFrom} to ${selectedBooking.timeTo}`}
                    </td>
                  </tr>
                  <tr>
                    <th>Purpose</th>
                    <td colSpan="3">{selectedBooking.purpose || '—'}</td>
                  </tr>
                  <tr>
                    <th>Facilities</th>
                    <td colSpan="3">
                      {Array.isArray(selectedBooking.facilities) ? (
                        selectedBooking.facilities.length > 0 ? (
                          selectedBooking.facilities.map((item, index) => (
                            <div key={index} style={{ marginBottom: '6px' }}>
                              • {item}
                            </div>
                          ))
                        ) : (
                          '—'
                        )
                      ) : typeof selectedBooking.facilities === 'string' ? (
                        selectedBooking.facilities
                          .replace(/([A-Z])/g, '|||$1')
                          .split('|||')
                          .filter(Boolean)
                          .map((item, index) => (
                            <div key={index} style={{ marginBottom: '6px' }}>
                              • {item.trim()}
                            </div>
                          ))
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th>Remarks / Special Arrangements</th>
                    <td colSpan="3">{selectedBooking.remarks || 'None'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Furniture Details */}
              <h6 className="mt-4 mb-2 text-primary">Furniture Requirements</h6>
              <table className="table table-sm table-bordered">
                <tbody>
                  <tr>
                    <th>No. of Tables (with cloth)</th>
                    <td>{selectedBooking.tablesWithCloth || 0}</td>
                    <th>No. of Tables (without cloth)</th>
                    <td>{selectedBooking.tablesWithoutCloth || 0}</td>
                  </tr>
                  <tr>
                    <th>Executive Chairs</th>
                    <td>{selectedBooking.executiveChairs || 0}</td>
                    <th>Participant Chairs</th>
                    <td>{selectedBooking.participantChairs || 0}</td>
                  </tr>
                  <tr>
                    <th>Additional Plastic Chairs</th>
                    <td>{selectedBooking.additionalPlasticChairs || 0}</td>
                    <th>Assigned Staff</th>
                    <td>{selectedBooking.assignedStaff || 'Not assigned'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Admin Remarks */}
              {selectedBooking.adminRemarks && (
                <>
                  <h6 className="mt-4 mb-2 text-primary">Admin Remarks</h6>
                  <div className="card mb-3">
                    <div className="card-body">
                      {selectedBooking.adminRemarks}
                    </div>
                  </div>
                </>
              )}

              {/* User Remarks */}
              {selectedBooking.userRemarks && (
                <>
                  <h6 className="mt-4 mb-2 text-primary">User Remarks</h6>
                  <div className="card mb-3">
                    <div className="card-body">
                      {selectedBooking.userRemarks}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p>No booking selected.</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewModalShow(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>


      {/* Remarks Modal */}
      <Modal
        show={remarksModalShow}
        onHide={() => setRemarksModalShow(false)}
        size="md"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Admin Remarks</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Admin Remarks (visible to admin users only):</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Enter admin remarks here"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRemarksModalShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveRemarks}>
            Save Admin Remarks
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default RoomBookingList;
