import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Form, Button, Modal, Pagination } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";

function MyRepairRequests() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newRemark, setNewRemark] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can adjust this number

  const username = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  const department = localStorage.getItem("department");
  const email = localStorage.getItem("email");
  const phone = localStorage.getItem("phone");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch(
        `https://proccms-backend.onrender.com/api/repair-requests?username=${username}&role=${role}&department=${department}`
      );
      const data = await res.json();

      const mapped = data.map((req) => ({
        id: req._id,
        date: new Date(req.createdAt).toLocaleString(),
        description: req.description,
        type: req.isNewRequirement ? "New Requirement" : "Repair Request",
        assignedTo: req.assignedTo || "--- Not Assigned ---",
        status: req.status || "Pending",
        fileUrl: req.fileUrl ? `https://proccms-backend.onrender.com${req.fileUrl}` : null,
        remarks: req.remarks || [],
        completedAt: req.completedAt ? new Date(req.completedAt).toLocaleString() : null,
        isVerified: req.isVerified || false
      }));

      setRequests(mapped);
      setFilteredRequests(mapped);
      setCurrentPage(1); // Reset to first page when data changes
    } catch (err) {
      toast.error("Error loading requests: " + err.message);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleFilter = () => {
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    const filtered = requests.filter((r) => {
      const created = new Date(r.date);
      return (
        (!fromDate || created >= fromDate) &&
        (!toDate || created <= new Date(toDate).setHours(23, 59, 59, 999))
      );
    });

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleViewClick = (req) => {
    setSelectedRequest(req);
    setShowViewModal(true);
  };

  const handleRemarksClick = (req) => {
    setSelectedRequest(req);
    setNewRemark("");
    setShowRemarksModal(true);
  };

  const handleSaveRemark = async () => {
    try {
      const enteredBy = username || "User";

      const res = await fetch(
        `https://proccms-backend.onrender.com/api/repair-requests/${selectedRequest.id}/remarks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: newRemark,
            enteredBy
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to save remark");

      toast.success("Remark added successfully!");
      setShowRemarksModal(false);
      fetchRequests(); // Refresh the list
    } catch (err) {
      toast.error("Error saving remark: " + err.message);
    }
  };
  const handleVerify = async (id) => {
    try {
      const res = await fetch(
        `https://proccms-backend.onrender.com/api/repair-requests/${id}/verify`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isVerified: true }),
        }
      );

      if (!res.ok) throw new Error("Verification failed");

      toast.success("Request verified successfully!");
      fetchRequests(); // Refresh table
    } catch (err) {
      toast.error("Error verifying request: " + err.message);
    }
  };


  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-success text-white";
      case "in progress":
        return "bg-info text-white";
      case "duplicate":
        return "bg-warning text-dark";
      case "refer remark":
        return "bg-primary text-white";
      case "rejected":
        return "bg-danger text-white";
      case "assigned":
        return "bg-warning text-dark";
      case "pending":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => paginate(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
          />
          {items}
          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => paginate(currentPage + 1)}
          />
        </Pagination>
      </div>
    );
  };

  return (
    <Container fluid className="p-4 mt-5" style={{ backgroundColor: "#f8f9fa" }}>
      <h5 className="mb-4 fw-bold">📋 My Repair Requests</h5>

      {/* Date Filter */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Date From</Form.Label>
            <Form.Control
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Date To</Form.Label>
            <Form.Control
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={2} className="d-flex align-items-end">
          <Button variant="primary" onClick={handleFilter}>
            Search
          </Button>
        </Col>
      </Row>

      {/* Table */}
      <Row>
        <Col>
          <Table responsive bordered hover size="sm">
            <thead className="table-light text-center align-middle">
              <tr>
                <th>Sl No</th>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>File</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Verification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-center align-middle">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-muted">
                    No repair requests found.
                  </td>
                </tr>
              ) : (
                currentItems.map((req, idx) => (
                  <tr key={req.id}>
                    <td>{indexOfFirstItem + idx + 1}</td>
                    <td>{req.date}</td>
                    <td className="text-start">{req.description}</td>
                    <td>{req.type}</td>
                    <td>
                      {req.fileUrl ? (
                        <a
                          href={req.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={req.fileUrl}
                            alt="attachment"
                            style={{ maxWidth: 40 }}
                          />
                        </a>
                      ) : (
                        "No file"
                      )}
                    </td>
                    <td>{req.assignedTo}</td>
                    <td>
                      <span
                        className={`badge px-3 py-2 rounded-pill fw-semibold ${getStatusBadgeClass(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === "Completed" ? (
                        req.isVerified ? (
                          <span className="badge bg-success">Verified ✅</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => handleVerify(req.id)}
                          >
                            Verify Work
                          </Button>
                        )
                      ) : (
                        <span className="text-muted">--</span>
                      )}
                    </td>

                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleViewClick(req)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-warning"
                          onClick={() => handleRemarksClick(req)}
                        >
                          Remarks
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          {renderPagination()}
        </Col>
      </Row>

      {/* View Details Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>🔍 Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Request Date:</strong> {selectedRequest.date}
                </Col>
                <Col md={6}>
                  <strong>Completed Date:</strong>{" "}
                  {selectedRequest.completedAt || "Not completed"}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <strong>Description:</strong>
                  <div className="border p-2 rounded bg-light mt-1">
                    {selectedRequest.description}
                  </div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <strong>Attachment:</strong>
                  <div className="mt-2">
                    {selectedRequest.fileUrl ? (
                      <a
                        href={selectedRequest.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={selectedRequest.fileUrl}
                          alt="attachment"
                          style={{ maxWidth: "100%" }}
                        />
                      </a>
                    ) : (
                      "No attachment"
                    )}
                  </div>
                </Col>
              </Row>

              {/* Verification Status */}
              {selectedRequest.status === "Completed" && (
                <Row className="mb-3">
                  <Col>
                    <strong>Verification Status:</strong>{" "}
                    {selectedRequest.isVerified ? (
                      <span className="badge bg-success">Verified</span>
                    ) : (
                      <span className="badge bg-warning">Pending Verification</span>
                    )}
                  </Col>
                </Row>
              )}

              {/* Remarks History Section */}
              <h6 className="mt-4 fw-bold">📝 Remarks History</h6>
              {selectedRequest.remarks && selectedRequest.remarks.length > 0 ? (
                <Table bordered hover size="sm" className="mt-2">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Remark</th>
                      <th>Added By</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequest.remarks.map((remark, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{remark.text}</td>
                        <td>{remark.enteredBy}</td>
                        <td>
                          {new Date(remark.date).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No remarks available</p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowViewModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Remarks Modal with Add Remark Functionality */}
      <Modal
        show={showRemarksModal}
        onHide={() => setShowRemarksModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>📝 Remarks for Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Add New Remark Section */}
          <div className="mb-4 p-3 border rounded">
            <h6>Add New Remark</h6>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={3}
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Enter your remark here..."
              />
            </Form.Group>
            <div className="d-flex justify-content-end mt-2">
              <Button
                variant="primary"
                onClick={handleSaveRemark}
                disabled={!newRemark.trim()}
              >
                Add Remark
              </Button>
            </div>
          </div>

          {/* Remarks History Section */}
          <h6 className="mt-3 fw-bold">Remarks History</h6>
          {selectedRequest?.remarks?.length > 0 ? (
            <Table bordered hover size="sm" className="mt-2">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Remark</th>
                  <th>Added By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {selectedRequest.remarks.map((remark, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{remark.text}</td>
                    <td>{remark.enteredBy}</td>
                    <td>
                      {new Date(remark.date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No remarks available for this request</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRemarksModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer autoClose={800} position="top-center" />
    </Container>
  );
}

export default MyRepairRequests;

// import React, { useEffect, useState } from "react";
// import { Container, Row, Col, Table, Form, Button, Modal } from "react-bootstrap";

// function MyRepairRequests() {
//   const [requests, setRequests] = useState([]);
//   const [filteredRequests, setFilteredRequests] = useState([]);
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");

//   // View modal state
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [selectedRequest, setSelectedRequest] = useState(null);

//   // Edit remark modal state
//   const [showRemarkModal, setShowRemarkModal] = useState(false);
//   const [editRemark, setEditRemark] = useState("");

//   const username = localStorage.getItem("username");
//   const role = localStorage.getItem("role");
//   const department = localStorage.getItem("department")
//   const email = localStorage.getItem("email");
//   const phone = localStorage.getItem("phone");

//   useEffect(() => {
//     fetch(`http://localhost:5000/api/repair-requests?username=${username}&role=${role}&department=${department}`)
//       .then((res) => res.json())
//       .then((data) => {
//         const mapped = data.map((req) => ({
//           id: req._id,
//           date: req.createdAt,
//           formattedDate: new Date(req.createdAt).toLocaleString(),
//           description: req.description,
//           type: req.isNewRequirement ? "New Requirement" : "Repair Request",
//           assignedTo: req.assignedTo || "--- Not Assigned ---",
//           status: req.status || "Pending",
//           fileUrl: req.fileUrl ? `http://localhost:5000${req.fileUrl}` : "https://via.placeholder.com/40",
//           remark: req.remark || "",
//         }));
//         setRequests(mapped);
//         setFilteredRequests(mapped);
//       })
//       .catch((err) => alert("Error: " + err.message));
//   }, [username, role]);

//   const getStatusBadgeClass = (status) => {
//     switch (status.toLowerCase()) {
//       case "completed":
//         return "bg-success text-white";
//       case "in progress":
//         return "bg-info text-white";
//       case "duplicate":
//         return "bg-warning text-dark";
//       case "refer remark":
//         return "bg-primary text-white";
//       case "rejected":
//         return "bg-danger text-white";
//       case "assigned":
//         return "bg-warning text-dark";
//       case "pending":
//         return "bg-danger text-white"; // 🔴 Red for Pending
//       default:
//         return "bg-secondary text-white";
//     }
//   };

//   const handleFilter = () => {
//     const fromDate = dateFrom ? new Date(dateFrom) : null;
//     const toDate = dateTo ? new Date(dateTo) : null;

//     const filtered = requests.filter((r) => {
//       const created = new Date(r.date);
//       return (
//         (!fromDate || created >= fromDate) &&
//         (!toDate || created <= new Date(toDate).setHours(23, 59, 59, 999))
//       );
//     });

//     setFilteredRequests(filtered);
//   };

//   // Open view modal with all details
//   const handleView = (req) => {
//     setSelectedRequest(req);
//     setShowViewModal(true);
//   };

//   // Open edit remark modal
//   const handleEditRemark = (req) => {
//     setSelectedRequest(req);
//     setEditRemark(req.remark || "");
//     setShowRemarkModal(true);
//   };

//   // Save updated remark to backend (implement your API here)
//   const handleSaveRemark = async () => {
//     try {
//       const res = await fetch(`http://localhost:5000/api/repair-requests/${selectedRequest.id}/remark`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ remark: editRemark }),
//       });

//       if (!res.ok) throw new Error("Failed to update remark");

//       // Update remark locally after successful update
//       setRequests((prev) =>
//         prev.map((req) =>
//           req.id === selectedRequest.id ? { ...req, remark: editRemark } : req
//         )
//       );
//       setFilteredRequests((prev) =>
//         prev.map((req) =>
//           req.id === selectedRequest.id ? { ...req, remark: editRemark } : req
//         )
//       );

//       setShowRemarkModal(false);
//       alert("Remark updated successfully");
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   return (
//     <Container fluid className="p-4 mt-5" style={{ backgroundColor: "#f8f9fa" }}>
//       <h5 className="mb-4 fw-bold">📋 My Repair Requests</h5>

//       {/* Date Filter */}
//       <Row className="mb-4">
//         <Col md={3}>
//           <Form.Group>
//             <Form.Label>Date From</Form.Label>
//             <Form.Control type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
//           </Form.Group>
//         </Col>
//         <Col md={3}>
//           <Form.Group>
//             <Form.Label>Date To</Form.Label>
//             <Form.Control type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
//           </Form.Group>
//         </Col>
//         <Col md={2} className="d-flex align-items-end">
//           <Button variant="primary" onClick={handleFilter}>
//             Search
//           </Button>
//         </Col>
//       </Row>

//       {/* Table */}
//       <Row>
//         <Col>
//           <Table responsive bordered hover size="sm">
//             <thead className="table-light text-center align-middle">
//               <tr>
//                 <th>Sl No</th>
//                 <th>Date</th>
//                 <th>Description</th>
//                 <th>New/Repair</th>
//                 <th>File</th>
//                 <th>Assigned To</th>
//                 <th>Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody className="text-center align-middle">
//               {filteredRequests.length === 0 ? (
//                 <tr>
//                   <td colSpan="8" className="text-muted">
//                     No repair requests found.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredRequests.map((req, idx) => (
//                   <tr key={req.id}>
//                     <td>{idx + 1}</td>
//                     <td>{req.formattedDate}</td>
//                     <td className="text-start">{req.description}</td>
//                     <td>{req.type}</td>
//                     <td>
//                       <a href={req.fileUrl} target="_blank" rel="noopener noreferrer">
//                         <img src={req.fileUrl} alt="file" style={{ maxWidth: 40 }} />
//                       </a>
//                     </td>
//                     <td>{req.assignedTo}</td>
//                     <td>
//                       <span className={`badge px-3 py-2 rounded-pill fw-semibold ${getStatusBadgeClass(req.status)}`}>
//                         {req.status}
//                       </span>
//                     </td>
//                     <td>
//                       <Button
//                         size="sm"
//                         variant="outline-primary"
//                         className="me-2"
//                         onClick={() => handleView(req)}
//                       >
//                         View
//                       </Button>
//                       <Button size="sm" variant="outline-warning" onClick={() => handleEditRemark(req)}>
//                         Remark
//                       </Button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </Table>
//         </Col>
//       </Row>

//       {/* View Details Modal */}
//       <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>🔍 Repair Request Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedRequest && (
//             <>
//               {/* 🧍 User Info Section */}
//               <h6 className="fw-bold mb-3 text-primary">👤 User Information</h6>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Name:</strong> {username}</Col>
//                 <Col md={6}><strong>Department:</strong> {department}</Col>
//               </Row>
//               <Row className="mb-4">
//                 <Col md={6}><strong>Email:</strong> {email}</Col>
//                 <Col md={6}><strong>Mobile:</strong> {phone}</Col>

//               </Row>

//               {/* 🛠️ Request Info Section */}
//               <h6 className="fw-bold mb-3 text-success">🛠️ Request Information</h6>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Request Date:</strong> {selectedRequest.formattedDate}</Col>
//                 <Col md={6}><strong>Completed Date:</strong> {selectedRequest.completedDate || "-"}</Col>
//               </Row>
//               <Row className="mb-4">
//                 <Col>
//                   <strong>Request Details:</strong>
//                   <div className="border p-2 rounded bg-light mt-1">{selectedRequest.description}</div>
//                 </Col>
//               </Row>

//               {/* 💬 Remarks History Section */}
//               <h6 className="fw-bold mb-3 text-warning">💬 Remarks History</h6>
//               {selectedRequest.remarksHistory && selectedRequest.remarksHistory.length > 0 ? (
//                 <Table bordered hover size="sm" className="mb-0">
//                   <thead className="table-light">
//                     <tr>
//                       <th>#</th>
//                       <th>Remark</th>
//                       <th>Entered By</th>
//                       <th>Date</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {selectedRequest.remarksHistory.map((remark, index) => (
//                       <tr key={index}>
//                         <td>{index + 1}</td>
//                         <td>{remark.remark}</td>
//                         <td>{remark.enteredBy}</td>
//                         <td>{new Date(remark.date).toLocaleString()}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               ) : (
//                 <p className="text-muted">No remarks available.</p>
//               )}
//             </>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowViewModal(false)}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Edit Remark Modal */}
//       <Modal show={showRemarkModal} onHide={() => setShowRemarkModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>✏️ Update Remark</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group>
//             <Form.Label>Remark</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={4}
//               value={editRemark}
//               onChange={(e) => setEditRemark(e.target.value)}
//               placeholder="Enter your remark here"
//             />
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowRemarkModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleSaveRemark}>
//             Save
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// }

// export default MyRepairRequests;
