import React, { useEffect, useState } from "react";
import {
  Table,
  Modal,
  Spinner,
  Badge,
  Form,
  Row,
  Col,
  Pagination,
  Button,
} from "react-bootstrap";
import axios from "axios";

function StaffAllBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const username = localStorage.getItem("name");

  useEffect(() => {
    fetchAllBookings();
  }, []);

  useEffect(() => {
    applyDateFilter();
    setCurrentPage(1);
  }, [fromDate, toDate, bookings]);

  const fetchAllBookings = async () => {
    try {
      const response = await axios.get(
        "https://proccms-backend.onrender.com/api/room-booking/staff-all",
        { params: { username } }
      );
      setBookings(response.data);
      setFilteredBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = () => {
    if (!fromDate && !toDate) {
      setFilteredBookings(bookings);
      return;
    }

    const filtered = bookings.filter((b) => {
      const bookingDate = new Date(b.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      if (from && to) return bookingDate >= from && bookingDate <= to;
      if (from) return bookingDate >= from;
      if (to) return bookingDate <= to;
      return true;
    });

    setFilteredBookings(filtered);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const getRoleTag = (booking) => {
    if (booking.username === username && booking.assignedStaff === username)
      return <Badge bg="primary">Requester & Assigned</Badge>;
    if (booking.username === username)
      return <Badge bg="success">Requested</Badge>;
    if (booking.assignedStaff === username)
      return <Badge bg="warning text-dark">Assigned</Badge>;
    return null;
  };

  return (
    <div className="container mt-4 p-5 bg-white rounded shadow-sm">
      <h4 className="mb-4 text-primary fw-bold">
        My Assigned & Requested Bookings
      </h4>

      {/* Date filter */}
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
        <>
          <Table striped bordered hover responsive className="shadow-sm">
            <thead className="table-primary text-center">
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Room</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {currentBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.date}</td>
                  <td>
                    {booking.timeFrom} - {booking.timeTo}
                  </td>
                  <td>{booking.roomType}</td>
                  <td>{booking.purpose}</td>
                  <td>
                    <Badge
                      bg={
                        booking.status === "Booked"
                          ? "success"
                          : booking.status === "Cancelled"
                          ? "danger"
                          : "warning text-dark"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </td>
                  <td>{getRoleTag(booking)}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleView(booking)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {filteredBookings.length > itemsPerPage && (
            <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.First
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <Pagination.Item
                      key={number}
                      active={number === currentPage}
                      onClick={() => paginate(number)}
                    >
                      {number}
                    </Pagination.Item>
                  )
                )}
                <Pagination.Next
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Staff View Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Assigned Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div className="border rounded p-3" style={{ fontSize: "14px" }}>
              {/* Basic info */}
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Room:</strong> {selectedBooking.roomType}
                </Col>
                <Col md={6}>
                  <strong>Date:</strong> {selectedBooking.date}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Time:</strong> {selectedBooking.timeFrom} - {selectedBooking.timeTo}
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> {selectedBooking.status}
                </Col>
              </Row>

              {/* Purpose & Requester */}
              <p><strong>Purpose:</strong> {selectedBooking.purpose || "—"}</p>
              <p><strong>Requested By:</strong> {selectedBooking.username}</p>

              {/* Facility items */}
              <h6 className="mt-4 text-primary">Facilities Required</h6>
              <Table bordered size="sm">
                <tbody>
                  <tr>
                    <td><strong>Chairs</strong></td>
                    <td>{selectedBooking.participantChairs || selectedBooking.additionalPlasticChairs || "No"}</td>
                    <td><strong>Tables</strong></td>
                    <td>{selectedBooking.tablesWithCloth || selectedBooking.tablesWithoutCloth || "No"}</td>
                  </tr>
                  <tr>
                    <td><strong>Projector</strong></td>
                    <td>{selectedBooking.projector || "No"}</td>
                    <td><strong>Podium</strong></td>
                    <td>{selectedBooking.podium || "No"}</td>
                  </tr>
                  <tr>
                    <td><strong>Microphone</strong></td>
                    <td>{selectedBooking.microphone || "No"}</td>
                    <td><strong>Sound System</strong></td>
                    <td>{selectedBooking.soundSystem || "No"}</td>
                  </tr>
                  <tr>
                    <td><strong>Extension Box</strong></td>
                    <td>{selectedBooking.extensionBox || "No"}</td>
                    <td><strong>AC / Fan</strong></td>
                    <td>{selectedBooking.ac || selectedBooking.fan || "No"}</td>
                  </tr>
                </tbody>
              </Table>

              {/* Remarks */}
              <p className="mt-3">
                <strong>Remarks:</strong> {selectedBooking.remarks || "None"}
              </p>

              {/* Admin remarks */}
              {selectedBooking.adminRemarks && (
                <div className="card mt-3 border-secondary">
                  <div className="card-header bg-light">
                    <strong>Admin Remarks</strong>
                  </div>
                  <div className="card-body">{selectedBooking.adminRemarks}</div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default StaffAllBookings;




// import React, { useEffect, useState } from 'react';
// import { Table, Modal, Spinner, Badge, Form, Row, Col, Pagination } from 'react-bootstrap';
// import axios from 'axios';

// function StaffAllBookings() {
//     const [bookings, setBookings] = useState([]);
//     const [filteredBookings, setFilteredBookings] = useState([]);
//     const [selectedBooking, setSelectedBooking] = useState(null);
//     const [showModal, setShowModal] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [fromDate, setFromDate] = useState('');
//     const [toDate, setToDate] = useState('');
//     // Pagination state
//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage] = useState(10); // You can adjust this number

//     const username = localStorage.getItem('name');

//     useEffect(() => {
//         fetchAllBookings();
//     }, []);

//     useEffect(() => {
//         applyDateFilter();
//         setCurrentPage(1); // Reset to first page when filters change
//     }, [fromDate, toDate, bookings]);

//     const fetchAllBookings = async () => {
//         try {
//             const response = await axios.get('https://proccms-backend.onrender.com/api/room-booking/staff-all', {
//                 params: { username },
//             });
//             setBookings(response.data);
//             setFilteredBookings(response.data);
//         } catch (error) {
//             console.error('Error fetching bookings:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const applyDateFilter = () => {
//         if (!fromDate && !toDate) {
//             setFilteredBookings(bookings);
//             return;
//         }

//         const filtered = bookings.filter(b => {
//             const bookingDate = new Date(b.date);
//             const from = fromDate ? new Date(fromDate) : null;
//             const to = toDate ? new Date(toDate) : null;

//             if (from && to) {
//                 return bookingDate >= from && bookingDate <= to;
//             } else if (from) {
//                 return bookingDate >= from;
//             } else if (to) {
//                 return bookingDate <= to;
//             }
//             return true;
//         });

//         setFilteredBookings(filtered);
//     };

//     // Get current bookings for pagination
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
//     const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

//     // Change page
//     const paginate = (pageNumber) => setCurrentPage(pageNumber);

//     const handleView = (booking) => {
//         setSelectedBooking(booking);
//         setShowModal(true);
//     };

//     const getRoleTag = (booking) => {
//         if (booking.username === username && booking.assignedStaff === username) {
//             return <Badge bg="primary">Requester & Assigned</Badge>;
//         } else if (booking.username === username) {
//             return <Badge bg="success">Requested</Badge>;
//         } else if (booking.assignedStaff === username) {
//             return <Badge bg="warning text-dark">Assigned</Badge>;
//         }
//         return null;
//     };

//     return (
//         <div className="container mt-4 p-5">
//             <h4 className="mb-4">My Room Bookings (Requested & Assigned)</h4>

//             {/* From - To Date Filter */}
//             <Row className="mb-4">
//                 <Col md={3}>
//                     <Form.Label>From Date:</Form.Label>
//                     <Form.Control
//                         type="date"
//                         value={fromDate}
//                         onChange={(e) => setFromDate(e.target.value)}
//                     />
//                 </Col>
//                 <Col md={3}>
//                     <Form.Label>To Date:</Form.Label>
//                     <Form.Control
//                         type="date"
//                         value={toDate}
//                         onChange={(e) => setToDate(e.target.value)}
//                     />
//                 </Col>
//             </Row>

//             {loading ? (
//                 <Spinner animation="border" />
//             ) : filteredBookings.length === 0 ? (
//                 <p>No bookings found.</p>
//             ) : (
//                 <>
//                     <Table striped bordered hover responsive>
//                         <thead>
//                             <tr>
//                                 <th>Date</th>
//                                 <th>Time</th>
//                                 <th>Room</th>
//                                 <th>Purpose</th>
//                                 <th>Status</th>
//                                 <th>Type</th>
//                                 <th>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {currentBookings.map((booking) => (
//                                 <tr key={booking._id}>
//                                     <td>{booking.date}</td>
//                                     <td>{booking.timeFrom} - {booking.timeTo}</td>
//                                     <td>{booking.roomType}</td>
//                                     <td>{booking.purpose}</td>
//                                     <td>
//                                         <Badge bg={
//                                             booking.status === 'Booked' ? 'success' :
//                                                 booking.status === 'Cancelled' ? 'danger' :
//                                                     'warning text-dark'
//                                         }>
//                                             {booking.status}
//                                         </Badge>
//                                     </td>
//                                     <td>{getRoleTag(booking)}</td>
//                                     <td>
//                                         <button className="btn btn-info btn-sm" onClick={() => handleView(booking)}>
//                                             View
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </Table>

//                     {/* Pagination */}
//                     {filteredBookings.length > itemsPerPage && (
//                         <div className="d-flex justify-content-center">
//                             <Pagination>
//                                 <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
//                                 <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                                
//                                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
//                                     <Pagination.Item 
//                                         key={number} 
//                                         active={number === currentPage}
//                                         onClick={() => paginate(number)}
//                                     >
//                                         {number}
//                                     </Pagination.Item>
//                                 ))}
                                
//                                 <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
//                                 <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
//                             </Pagination>
//                         </div>
//                     )}
//                 </>
//             )}

//             {/* Modal */}
//             <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
//                 <Modal.Header closeButton>
//                     <Modal.Title>Booking Details</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>
//                     {selectedBooking && (
//                         <>
//                             <p><strong>Room:</strong> {selectedBooking.roomType}</p>
//                             <p><strong>Date:</strong> {selectedBooking.date}</p>
//                             <p><strong>Time:</strong> {selectedBooking.timeFrom} - {selectedBooking.timeTo}</p>
//                             <p><strong>Purpose:</strong> {selectedBooking.purpose}</p>
//                             <p><strong>Status:</strong> {selectedBooking.status}</p>
//                             <p><strong>Remarks:</strong> {selectedBooking.remarks}</p>
//                             <p><strong>Requested By:</strong> {selectedBooking.username}</p>
//                             <p><strong>Assigned Staff:</strong> {selectedBooking.assignedStaff || "None"}</p>

//                             {selectedBooking.adminRemarks && (
//                                 <div className="card mt-3">
//                                     <div className="card-header bg-light">
//                                         <strong>Admin Remarks</strong>
//                                     </div>
//                                     <div className="card-body">
//                                         {selectedBooking.adminRemarks}
//                                     </div>
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </Modal.Body>
//             </Modal>
//         </div>
//     );
// }

// export default StaffAllBookings;