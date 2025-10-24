import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Container,
  Row,
  Col,
  Form,
  Badge,
  Stack,
  Pagination,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [repairRequests, setRepairRequests] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [repairDateFrom, setRepairDateFrom] = useState("");
  const [repairDateTo, setRepairDateTo] = useState("");
  const [bookingDateFrom, setBookingDateFrom] = useState("");
  const [bookingDateTo, setBookingDateTo] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [repairPage, setRepairPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const itemsPerPage = 10;

  const department = localStorage.getItem("department") || "N/A";
  const username = localStorage.getItem("name");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyRepairRequests();
    fetchMyRoomBookings();
  }, []);

  // Fetch repair requests
  const fetchMyRepairRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://proccms-backend.onrender.com/api/repair-requests",
        {
          params: {
            role: "user",
            username,
            department,
            dateFrom: repairDateFrom,
            dateTo: repairDateTo,
          },
        }
      );
      setRepairRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch repair requests", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch room bookings
  const fetchMyRoomBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://proccms-backend.onrender.com/api/room-booking",
        {
          params: {
            requestFrom: username,
            department,
          },
        }
      );

      const filtered = res.data.filter((item) => {
        const created = new Date(item.createdAt);
        const from = bookingDateFrom ? new Date(bookingDateFrom) : null;
        const to = bookingDateTo ? new Date(bookingDateTo) : null;
        return (!from || created >= from) && (!to || created <= to);
      });

      setRoomBookings(filtered);
    } catch (error) {
      console.error("Failed to fetch room bookings", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    const s = status?.toLowerCase();
    const colorMap = {
      assigned: "info",
      cancelled: "danger",
      canceled: "danger",
      booked: "success",
      completed: "success",
      pending: "warning",
      verified: "secondary",
    };
    return <Badge bg={colorMap[s] || "secondary"}>{status}</Badge>;
  };

  // Pagination helpers
  const paginate = (data, currentPage) => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  const renderPagination = (dataLength, currentPage, setPage) => {
    const totalPages = Math.ceil(dataLength / itemsPerPage);
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => setPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return (
      <div className="d-flex justify-content-end mt-3">
        <Pagination size="sm" className="mb-0">
          {pages}
        </Pagination>
      </div>
    );
  };

  return (
    <Container className="py-5" fluid>
      <div className="bg-white p-3 shadow-sm rounded mb-3 border">
        <Row className="align-items-center">
          <Col xs={12} md={6}>
            <h4 className="fw-bold text-primary mb-2 mb-md-0">
              User Dashboard
            </h4>
          </Col>
          <Col xs={12} md={6} className="text-md-end">
            <span className="fw-semibold text-muted">
              Department: {department}
            </span>
          </Col>
        </Row>
      </div>

      {/* ---------- Repair Requests Section ---------- */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="bg-white p-3 shadow-sm rounded border">
            <Row className="align-items-center mb-3">
              <Col xs={12} md={6}>
                <h5 className="fw-semibold text-dark mb-2 mb-md-0">
                  Repair Requests
                </h5>
              </Col>
              <Col xs={12} md={6}>
                <Stack
                  direction="horizontal"
                  gap={2}
                  className="justify-content-md-end"
                >
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => navigate("/repair-request")}
                  >
                    + New Request
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate("/my-repair-requests")}
                  >
                    View All
                  </Button>
                </Stack>
              </Col>
            </Row>

            {/* Date Filter */}
            <Row className="mb-3 g-2">
              <Col xs={12} sm={6} md={4} lg={3}>
                <Form.Control
                  type="date"
                  value={repairDateFrom}
                  onChange={(e) => setRepairDateFrom(e.target.value)}
                  size="sm"
                />
              </Col>
              <Col xs={12} sm={6} md={4} lg={3}>
                <Form.Control
                  type="date"
                  value={repairDateTo}
                  onChange={(e) => setRepairDateTo(e.target.value)}
                  size="sm"
                />
              </Col>
              <Col xs={12} sm={6} md={4} lg={2}>
                <Button
                  variant="primary"
                  onClick={fetchMyRepairRequests}
                  size="sm"
                  className="w-100"
                >
                  Search
                </Button>
              </Col>
            </Row>

            {/* Table */}
            <div className="table-responsive">
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <>
                  <Table
                    striped
                    bordered
                    hover
                    size="sm"
                    className="mb-0 align-middle"
                  >
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Requested Date</th>
                        <th>Description</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repairRequests.length > 0 ? (
                        paginate(repairRequests, repairPage).map((item, idx) => (
                          <tr key={item._id}>
                            <td>
                              {(repairPage - 1) * itemsPerPage + idx + 1}
                            </td>
                            <td>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </td>
                            <td
                              className="text-truncate"
                              style={{ maxWidth: "300px" }}
                              title={item.description}
                            >
                              {item.description}
                            </td>
                            <td>{renderStatusBadge(item.status)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center text-muted py-3"
                          >
                            No repair requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                  {renderPagination(
                    repairRequests.length,
                    repairPage,
                    setRepairPage
                  )}
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* ---------- Room Bookings Section ---------- */}
      <Row>
        <Col xs={12}>
          <div className="bg-white p-3 shadow-sm rounded border">
            <Row className="align-items-center mb-3">
              <Col xs={12} md={6}>
                <h5 className="fw-semibold text-dark mb-2 mb-md-0">
                  Room Bookings
                </h5>
              </Col>
              <Col xs={12} md={6}>
                <Stack
                  direction="horizontal"
                  gap={2}
                  className="justify-content-md-end"
                >
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => navigate("/room-booking")}
                  >
                    + New Booking
                  </Button>
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => navigate("/my-bookings")}
                  >
                    View All
                  </Button>
                </Stack>
              </Col>
            </Row>

            {/* Date Filter */}
            <Row className="mb-3 g-2">
              <Col xs={12} sm={6} md={4} lg={3}>
                <Form.Control
                  type="date"
                  value={bookingDateFrom}
                  onChange={(e) => setBookingDateFrom(e.target.value)}
                  size="sm"
                />
              </Col>
              <Col xs={12} sm={6} md={4} lg={3}>
                <Form.Control
                  type="date"
                  value={bookingDateTo}
                  onChange={(e) => setBookingDateTo(e.target.value)}
                  size="sm"
                />
              </Col>
              <Col xs={12} sm={6} md={4} lg={2}>
                <Button
                  variant="primary"
                  onClick={fetchMyRoomBookings}
                  size="sm"
                  className="w-100"
                >
                  Search
                </Button>
              </Col>
            </Row>

            {/* Table */}
            <div className="table-responsive">
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <>
                  <Table
                    striped
                    bordered
                    hover
                    size="sm"
                    className="mb-0 align-middle"
                  >
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Booking Date</th>
                        <th>Purpose</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomBookings.length > 0 ? (
                        paginate(roomBookings, bookingPage).map(
                          (item, idx) => (
                            <tr key={item._id}>
                              <td>
                                {(bookingPage - 1) * itemsPerPage + idx + 1}
                              </td>
                              <td>
                                {new Date(item.createdAt).toLocaleDateString()}
                              </td>
                              <td
                                className="text-truncate"
                                style={{ maxWidth: "300px" }}
                                title={item.purpose}
                              >
                                {item.purpose || "---"}
                              </td>
                              <td>{renderStatusBadge(item.status)}</td>
                            </tr>
                          )
                        )
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center text-muted py-3"
                          >
                            No room bookings found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                  {renderPagination(
                    roomBookings.length,
                    bookingPage,
                    setBookingPage
                  )}
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;



// import React, { useEffect, useState } from 'react';
// import { Table, Button, Container, Row, Col, Form, Badge, Stack } from 'react-bootstrap';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const UserDashboard = () => {
//   const [repairRequests, setRepairRequests] = useState([]);
//   const [roomBookings, setRoomBookings] = useState([]);
//   const [repairDateFrom, setRepairDateFrom] = useState("");
//   const [repairDateTo, setRepairDateTo] = useState("");
//   const [bookingDateFrom, setBookingDateFrom] = useState("");
//   const [bookingDateTo, setBookingDateTo] = useState("");

//   const department = localStorage.getItem("department") || "N/A";
//   const username = localStorage.getItem("name");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchMyRepairRequests();
//     fetchMyRoomBookings();
//   }, []);

//   const fetchMyRepairRequests = async () => {
//     try {
//       const res = await axios.get('https://proccms-backend.onrender.com/api/repair-requests', {
//         params: {
//           role: "user",
//           username,
//           department,
//           dateFrom: repairDateFrom,
//           dateTo: repairDateTo,
//         }
//       });
//       setRepairRequests(res.data);
//     } catch (error) {
//       console.error("Failed to fetch repair requests", error);
//     }
//   };

//   const fetchMyRoomBookings = async () => {
//     try {
//       const res = await axios.get('https://proccms-backend.onrender.com/api/room-booking', {
//         params: {
//           requestFrom: username,
//           department
//         }
//       });

//       const filtered = res.data.filter(item => {
//         const created = new Date(item.createdAt);
//         const from = bookingDateFrom ? new Date(bookingDateFrom) : null;
//         const to = bookingDateTo ? new Date(bookingDateTo) : null;
//         return (!from || created >= from) && (!to || created <= to);
//       });

//       setRoomBookings(filtered);
//     } catch (error) {
//       console.error("Failed to fetch room bookings", error);
//     }
//   };

//   const renderStatusBadge = (status) => {
//     const statusLower = status.toLowerCase();

//     if (statusLower === 'assigned' || statusLower === 'cancelled' || statusLower === 'canceled') {
//       return <Badge bg="danger">{status}</Badge>;
//     }

//     if (statusLower === 'booked' || statusLower === 'completed') {
//       return <Badge bg="success">{status}</Badge>;
//     }

//     return <Badge bg="secondary">{status}</Badge>;
//   };

//   return (
//     <Container className="py-5" fluid>
//       <div className="bg-white p-3 shadow-sm rounded mb-3">
//         <Row className="align-items-center">
//           <Col xs={12} md={6}>
//             <h4 className="fw-bold mb-2 mb-md-0">User Dashboard</h4>
//           </Col>
//           <Col xs={12} md={6} className="text-md-end">
//             <span className="fw-semibold text-muted">Department: {department}</span>
//           </Col>
//         </Row>
//       </div>

//       {/* Repair Requests Section */}
//       <Row className="mb-3">
//         <Col xs={12}>
//           <div className="bg-white p-3 shadow-sm rounded">
//             <Row className="align-items-center mb-3">
//               <Col xs={12} md={6}>
//                 <h5 className="mb-2 mb-md-0">Last 1 Month Repair Requests</h5>
//               </Col>
//               <Col xs={12} md={6}>
//                 <Stack direction="horizontal" gap={2} className="justify-content-md-end">
//                   <Button variant="success" size="sm" onClick={() => navigate('/repair-request')}>
//                     New Request
//                   </Button>
//                   <Button variant="primary" size="sm" onClick={() => navigate('/my-repair-requests')}>
//                     View All
//                   </Button>
//                 </Stack>
//               </Col>
//             </Row>

//             <Row className="mb-3 g-2">
//               <Col xs={12} sm={6} md={4} lg={3}>
//                 <Form.Control
//                   type="date"
//                   value={repairDateFrom}
//                   onChange={(e) => setRepairDateFrom(e.target.value)}
//                   size="sm"
//                 />
//               </Col>
//               <Col xs={12} sm={6} md={4} lg={3}>
//                 <Form.Control
//                   type="date"
//                   value={repairDateTo}
//                   onChange={(e) => setRepairDateTo(e.target.value)}
//                   size="sm"
//                 />
//               </Col>
//               <Col xs={12} sm={6} md={4} lg={2}>
//                 <Button onClick={fetchMyRepairRequests} size="sm" className="w-100">
//                   Search
//                 </Button>
//               </Col>
//             </Row>

//             <div className="table-responsive">
//               <Table striped bordered hover size="sm" className="mb-0">
//                 <thead className="table-light">
//                   <tr>
//                     <th>#</th>
//                     <th>Requested Date</th>
//                     <th>Description</th>
//                     <th>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {repairRequests.length > 0 ? repairRequests.slice(0, 5).map((item, idx) => (
//                     <tr key={item._id}>
//                       <td>{idx + 1}</td>
//                       <td>{new Date(item.createdAt).toLocaleDateString()}</td>
//                       <td className="text-truncate" style={{maxWidth: '200px'}}>{item.description}</td>
//                       <td>{renderStatusBadge(item.status)}</td>
//                     </tr>
//                   )) : (
//                     <tr>
//                       <td colSpan="4" className="text-center text-muted">No repair requests found.</td>
//                     </tr>
//                   )}
//                 </tbody>
//               </Table>
//             </div>
//           </div>
//         </Col>
//       </Row>

//       {/* Room Bookings Section */}
//       <Row>
//         <Col xs={12}>
//           <div className="bg-white p-3 shadow-sm rounded">
//             <Row className="align-items-center mb-3">
//               <Col xs={12} md={6}>
//                 <h5 className="mb-2 mb-md-0">Last 1 Month Room Bookings</h5>
//               </Col>
//               <Col xs={12} md={6}>
//                 <Stack direction="horizontal" gap={2} className="justify-content-md-end">
//                   <Button variant="success" size="sm" onClick={() => navigate('/room-booking')}>
//                     New Booking
//                   </Button>
//                   <Button variant="warning" size="sm" onClick={() => navigate('/my-bookings')}>
//                     View All
//                   </Button>
//                 </Stack>
//               </Col>
//             </Row>

//             <Row className="mb-3 g-2">
//               <Col xs={12} sm={6} md={4} lg={3}>
//                 <Form.Control
//                   type="date"
//                   value={bookingDateFrom}
//                   onChange={(e) => setBookingDateFrom(e.target.value)}
//                   size="sm"
//                 />
//               </Col>
//               <Col xs={12} sm={6} md={4} lg={3}>
//                 <Form.Control
//                   type="date"
//                   value={bookingDateTo}
//                   onChange={(e) => setBookingDateTo(e.target.value)}
//                   size="sm"
//                 />
//               </Col>
//               <Col xs={12} sm={6} md={4} lg={2}>
//                 <Button onClick={fetchMyRoomBookings} size="sm" className="w-100">
//                   Search
//                 </Button>
//               </Col>
//             </Row>

//             <div className="table-responsive">
//               <Table striped bordered hover size="sm" className="mb-0">
//                 <thead className="table-light">
//                   <tr>
//                     <th>#</th>
//                     <th>Booking Date</th>
//                     <th>Purpose</th>
//                     <th>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {roomBookings.length > 0 ? roomBookings.slice(0, 5).map((item, idx) => (
//                     <tr key={item._id}>
//                       <td>{idx + 1}</td>
//                       <td>{new Date(item.createdAt).toLocaleDateString()}</td>
//                       <td className="text-truncate" style={{maxWidth: '200px'}}>{item.purpose || "---"}</td>
//                       <td>{renderStatusBadge(item.status)}</td>
//                     </tr>
//                   )) : (
//                     <tr>
//                       <td colSpan="4" className="text-center text-muted">No room bookings found.</td>
//                     </tr>
//                   )}
//                 </tbody>
//               </Table>
//             </div>
//           </div>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default UserDashboard;