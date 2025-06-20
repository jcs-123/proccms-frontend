import React, { useEffect, useState } from "react";
import { Container, Table, Form, Row, Col, Button, Badge, Modal } from "react-bootstrap";

function StaffRepairRequestList() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarksList, setRemarksList] = useState([]);
  const [newRemark, setNewRemark] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [allRemarksModal, setAllRemarksModal] = useState(false);
  const [allRemarks, setAllRemarks] = useState([]);

  const username = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "staff") {
      alert("Unauthorized access");
      return;
    }
    fetchAssignedRequests();
  }, []);

  const fetchAssignedRequests = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/repair-requests?role=staff&username=${username}`);
      if (!res.ok) throw new Error("Failed to fetch requests");

      const data = await res.json();
      const formatted = data.map((req) => ({
        id: req._id,
        date: new Date(req.createdAt).toISOString().split("T")[0],
        requestFrom: req.username,
        department: req.department || "Unknown", // <-- Add this
        details: req.description,
        type: req.isNewRequirement ? "New Requirement" : "Repair Request",
        fileUrl: req.fileUrl ? `http://localhost:5000${req.fileUrl}` : null,
        status: req.status || "Pending",
        assignedTo: req.assignedTo || "Not Assigned",
      }));

      setRequests(formatted);
      setFiltered(formatted);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleView = async (request) => {
    try {
      const res = await fetch(`http://localhost:5000/api/repair-requests/${request.id}/remarks`);
      if (!res.ok) throw new Error("Failed to fetch remarks");
      const remarks = await res.json();
      setSelectedRequest(request);
      setRemarksList(remarks);
      setShowViewModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemarks = async (request) => {
    try {
      const res = await fetch(`http://localhost:5000/api/repair-requests/${request.id}/remarks`);
      if (!res.ok) throw new Error("Failed to fetch remarks");
      const remarks = await res.json();
      setRemarksList(remarks);
      setSelectedRequest(request);
      setShowRemarksModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddRemark = async () => {
    if (!newRemark.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/repair-requests/${selectedRequest.id}/remarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newRemark, enteredBy: username }),
      });
      if (!res.ok) throw new Error("Failed to add remark");

      const updated = await res.json();
      setRemarksList(updated.remarks);
      setNewRemark("");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAllRemarksClick = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/repair-requests/all-remarks`);

      if (!res.ok) throw new Error("Failed to fetch all remarks");
      const data = await res.json();
      setAllRemarks(data);
      setAllRemarksModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/repair-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      const updated = requests.map((req) =>
        req.id === id ? { ...req, status: newStatus } : req
      );
      setRequests(updated);
      applyFilters(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  const applyFilters = (list = requests) => {
    let filteredList = list;
    if (statusFilter !== "All") {
      filteredList = filteredList.filter((r) => r.status === statusFilter);
    }
    if (fromDate) {
      filteredList = filteredList.filter((r) => new Date(r.date) >= new Date(fromDate));
    }
    if (toDate) {
      filteredList = filteredList.filter((r) => new Date(r.date) <= new Date(toDate));
    }
    setFiltered(filteredList);
  };

  return (
    <Container className="mt-4">
      <h4 style={{ textAlign: 'left', marginTop: '60px', marginBottom: '16px' }}>
        Repair Request List
      </h4>

      <Row className="mb-3 align-items-end">
        <Col md={3}>
          <Form.Label>Date from</Form.Label>
          <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </Col>
        <Col md={3}>
          <Form.Label>Date to</Form.Label>
          <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </Col>
        <Col md={3}>
          <Form.Label>Status</Form.Label>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Pending</option>
            <option>Assigned</option>
            <option>Completed</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Button variant="primary" className="w-100 mb-2" onClick={() => applyFilters()}>
            Search
          </Button>
          <Button variant="success" className="w-100" onClick={handleAllRemarksClick}>
            Remarks
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive className="text-center align-middle">
        <thead className="table-light">
          <tr>
            <th>Sl No</th>
            <th>Date</th>
            <th>Request From</th>
            <th>Request Details</th>
            <th>New/Repair</th>
            <th>File</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Update</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={10}>No repair requests found.</td></tr>
          ) : (
            filtered.map((req, idx) => (
              <tr key={req.id}>
                <td style={{
                  width: "100px",
                  textAlign: "center",
                  verticalAlign: "middle",
                  fontWeight: "bold",
                  fontSize: "15px"
                }}>
                  {idx + 1}
                </td>

                <td style={{
                  width: "200px",
                  textAlign: "center",
                  verticalAlign: "middle",
                  fontSize: "15px",
                  whiteSpace: "nowrap"
                }}>
                  {req.date}
                </td>

                <td style={{
                  width: "300px",
                  minWidth: "100px",
                  maxWidth: "100px",
                  textAlign: "left",             // aligns text to left inside cell
                  verticalAlign: "middle",       // aligns text vertically to middle
                  fontSize: "16px",
                  fontWeight: "normal",
                  wordBreak: "break-word",
                  whiteSpace: "normal",          // allows wrapping
                  lineHeight: "1.6",
                  backgroundColor: "#fafafa",
                  padding: "12px 14px"
                }}>
                  <strong>{req.requestFrom}</strong><br />
                  <span style={{ fontSize: "14px", color: "#666" }}>{req.department}</span>
                </td>


                <td style={{
                  minWidth: "260px",
                  maxWidth: "300px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  textAlign: "justify",
                  verticalAlign: "top",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  padding: "10px 14px",
                  backgroundColor: "#fafafa"
                }}>
                  {req.details}
                </td>

                <td>{req.type}</td>
                <td>
                  {req.fileUrl ? <a href={req.fileUrl} target="_blank" rel="noopener noreferrer">Image</a> : "No File"}
                </td>
                <td>{req.assignedTo}</td>
                <td><Badge bg={
                  req.status === "Pending" ? "dark" :
                    req.status === "Assigned" ? "warning" :
                      req.status === "Completed" ? "success" : "dark"
                }>{req.status}</Badge></td>
                <td style={{
                  minWidth: "129px",
                  verticalAlign: "middle",
                  padding: "8px 10px"
                }}>
                  <Form.Select
                    size="sm"
                    value={req.status}
                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    style={{
                      fontSize: "14px",
                      padding: "4px 8px"
                    }}
                  >
                    <option>Pending</option>
                    <option>Assigned</option>
                    <option>Completed</option>
                  </Form.Select>
                </td>

                <td style={{ minWidth: "140px" }}>
                  <div className="d-grid gap-2">
                    <Button variant="outline-primary" size="sm" onClick={() => handleView(req)}>👁️ View</Button>
                    <Button variant="outline-warning" size="sm" onClick={() => handleRemarks(req)}>📝 Remarks</Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Repair Request Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <Table bordered>
                <tbody>
                  <tr><th>ID</th><td>{selectedRequest.id}</td></tr>
                  <tr><th>Date</th><td>{selectedRequest.date}</td></tr>
                  <tr><th>Requested By</th><td>{selectedRequest.requestFrom}</td></tr>
                  <tr><th>Details</th><td>{selectedRequest.details}</td></tr>
                  <tr><th>Type</th><td>{selectedRequest.type}</td></tr>
                  <tr><th>Status</th><td>{selectedRequest.status}</td></tr>
                  <tr><th>Assigned To</th><td>{selectedRequest.assignedTo}</td></tr>
                  {selectedRequest.fileUrl && (
                    <tr><th>Attachment</th><td><a href={selectedRequest.fileUrl} target="_blank" rel="noopener noreferrer">View File</a></td></tr>
                  )}
                </tbody>
              </Table>
              <h5 className="mt-4">Remarks</h5>
              {remarksList.length === 0 ? <p className="text-muted">No remarks added yet.</p> : (
                <Table bordered size="sm">
                  <thead><tr><th>#</th><th>Entered By</th><th>Remark</th><th>Date</th></tr></thead>
                  <tbody>
                    {remarksList.map((remark, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{remark.enteredBy}</td>
                        <td>{remark.text}</td>
                        <td>{new Date(remark.date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button></Modal.Footer>
      </Modal>

      {/* Add Remark Modal */}
      <Modal show={showRemarksModal} onHide={() => setShowRemarksModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Add Remark</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group controlId="newRemark">
            <Form.Label>New Remark</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              placeholder="Enter your remark"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemarksModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddRemark}>Add Remark</Button>
        </Modal.Footer>
      </Modal>

      {/* All Remarks Modal */}
      <Modal show={allRemarksModal} onHide={() => setAllRemarksModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>All Remarks</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {allRemarks.length === 0 ? (
            <p>No remarks found.</p>
          ) : (
            <Table bordered responsive hover size="sm">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Request ID</th>
                  <th>Entered By</th>
                  <th style={{ minWidth: "250px" }}>Remark</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {allRemarks.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{r.requestId}</td>
                    <td>{r.enteredBy}</td>
                    <td style={{
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      lineHeight: "1.5",
                      fontSize: "14px",
                      padding: "8px"
                    }}>
                      {r.text}
                    </td>
                    <td>{new Date(r.date).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', hour12: true
                    })}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAllRemarksModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default StaffRepairRequestList;




// import React, { useEffect, useState } from "react";
// import { Container, Table, Form, Row, Col, Button, Badge } from "react-bootstrap";
// import { Modal } from "react-bootstrap";



// function StaffRepairRequestList() {
//   const [requests, setRequests] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [showRemarksModal, setShowRemarksModal] = useState(false);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [remarksList, setRemarksList] = useState([]);
//   const [newRemark, setNewRemark] = useState("");
//   const [showViewModal, setShowViewModal] = useState(false);



//   const username = localStorage.getItem("username");
//   const role = localStorage.getItem("role");



//   const handleView = async (request) => {
//     try {
//       const res = await fetch(`http://localhost:5000/api/repair-requests/${request.id}/remarks`);
//       if (!res.ok) throw new Error("Failed to fetch remarks");
//       const remarks = await res.json();

//       setSelectedRequest(request);
//       setRemarksList(remarks);
//       setShowViewModal(true);
//     } catch (err) {
//       alert(err.message);
//     }
//   };


//   const handleRemarks = async (request) => {
//     try {
//       const res = await fetch(`http://localhost:5000/api/repair-requests/${request.id}/remarks`);
//       if (!res.ok) throw new Error("Failed to fetch remarks");
//       const remarks = await res.json();
//       setRemarksList(remarks);
//       setSelectedRequest(request);
//       setShowRemarksModal(true);
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const handleAddRemark = async () => {
//     if (!newRemark.trim()) return;

//     try {
//       const res = await fetch(`http://localhost:5000/api/repair-requests/${selectedRequest.id}/remarks`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text: newRemark, enteredBy: username }),
//       });
//       if (!res.ok) throw new Error("Failed to add remark");

//       const updated = await res.json();
//       setRemarksList(updated.remarks);
//       setNewRemark("");
//     } catch (err) {
//       alert(err.message);
//     }
//   };


//   useEffect(() => {
//     if (role !== "staff") {
//       alert("Unauthorized access");
//       return;
//     }
//     fetchAssignedRequests();
//   }, []);

//   const fetchAssignedRequests = async () => {
//     try {
//       const params = new URLSearchParams({ role: "staff", username });
//       const res = await fetch(`http://localhost:5000/api/repair-requests?${params.toString()}`);
//       if (!res.ok) throw new Error("Failed to fetch requests");

//       const data = await res.json();
//       const formatted = data.map((req) => ({
//         id: req._id,
//         date: new Date(req.createdAt).toISOString().split("T")[0],
//         requestFrom: req.username,
//         details: req.description,
//         type: req.isNewRequirement ? "New Requirement" : "Repair Request",
//         fileUrl: req.fileUrl ? `http://localhost:5000${req.fileUrl}` : null,
//         status: req.status || "Pending",
//         assignedTo: req.assignedTo || "Not Assigned",
//       }));
//       setRequests(formatted);
//       setFiltered(formatted);
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const handleStatusChange = async (id, newStatus) => {
//     try {
//       const res = await fetch(`http://localhost:5000/api/repair-requests/${id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: newStatus }),
//       });
//       if (!res.ok) throw new Error("Failed to update status");

//       const updated = requests.map((req) =>
//         req.id === id ? { ...req, status: newStatus } : req
//       );
//       setRequests(updated);
//       applyFilters(updated);
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const applyFilters = (list = requests) => {
//     let filteredList = list;

//     if (statusFilter !== "All") {
//       filteredList = filteredList.filter((r) => r.status === statusFilter);
//     }

//     if (fromDate) {
//       filteredList = filteredList.filter((r) => new Date(r.date) >= new Date(fromDate));
//     }

//     if (toDate) {
//       filteredList = filteredList.filter((r) => new Date(r.date) <= new Date(toDate));
//     }

//     setFiltered(filteredList);
//   };

//   return (
//     <Container className="mt-4">
//       <h4 style={{ textAlign: 'left', marginTop: '60px', marginBottom: '16px' }}>
//         Repair Request List
//       </h4>


//       {/* Filter Section */}
//       <Row className="mb-3 align-items-end">
//         <Col md={3}>
//           <Form.Label>Date from</Form.Label>
//           <Form.Control
//             type="date"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//           />
//         </Col>
//         <Col md={3}>
//           <Form.Label>Date to</Form.Label>
//           <Form.Control
//             type="date"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//           />
//         </Col>
//         <Col md={3}>
//           <Form.Label>Status</Form.Label>
//           <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//             <option>All</option>
//             <option>Pending</option>
//             <option>Assigned</option>
//             <option>Completed</option>
//           </Form.Select>
//         </Col>
//         <Col md={3}>
//           <Button variant="primary" className="w-100 mb-2" onClick={() => applyFilters()}>
//             Search
//           </Button>
//           <Button variant="success" className="w-100" onClick={() => alert("Remarks Clicked")}>
//             Remarks
//           </Button>
//         </Col>
//       </Row>

//       {/* Table Section */}
//       <Table striped bordered hover responsive className="text-center align-middle">
//         <thead className="table-light">
//           <tr>
//             <th>Sl No</th>
//             <th>Date</th>
//             <th>Request From</th>
//             <th>Request Details</th>
//             <th>New/Repair</th>
//             <th>File</th>
//             <th>Assigned To</th>
//             <th>Status</th>
//             <th>Update</th>
//             <th>Actions</th>

//           </tr>
//         </thead>
//         <tbody>
//           {filtered.length === 0 ? (
//             <tr>
//               <td colSpan={9}>No repair requests found.</td>
//             </tr>
//           ) : (
//             filtered.map((req, idx) => (
//               <tr key={req.id}>
//                 <td>{idx + 1}</td>
//                 <td>{req.date}</td>
//                 <td>{req.requestFrom}</td>
//                 <td
//                   style={{
//                     width: "260px",
//                     maxWidth: "260px",
//                     minWidth: "240px",              // Ensure it doesn't shrink too much
//                     whiteSpace: "pre-wrap",
//                     wordBreak: "break-word",
//                     textAlign: "justify",
//                     verticalAlign: "top",           // Align text to top if content is tall
//                     fontSize: "15px",
//                     lineHeight: "1.7",
//                     padding: "10px 12px",           // Balanced horizontal & vertical spacing
//                     fontWeight: "normal",
//                     backgroundColor: "#fafafa",     // Optional: subtle background for readability
//                   }}
//                 >
//                   {req.details}
//                 </td>

//                 <td>{req.type}</td>
//                 <td>
//                   {req.fileUrl ? (
//                     <a href={req.fileUrl} target="_blank" rel="noopener noreferrer">
//                       Image
//                     </a>
//                   ) : (
//                     "No File"
//                   )}
//                 </td>
//                 <td>{req.assignedTo}</td>
//                 <td>
//                   <Badge bg={
//                     req.status === "Pending" ? "dark" :
//                       req.status === "Assigned" ? "warning" :
//                         req.status === "Completed" ? "success" : "dark"
//                   }>
//                     {req.status}
//                   </Badge>
//                 </td>
//                 <td
//                   style={{
//                     width: "125px",            // You can adjust this to your needs
//                     maxWidth: "160px",
//                     padding: "8px",
//                     textAlign: "center",
//                   }}
//                 >
//                   <Form.Select
//                     size="sm"
//                     style={{ width: "100%" }}   // Ensures it fits the td nicely
//                     value={req.status}
//                     onChange={(e) => handleStatusChange(req.id, e.target.value)}
//                   >
//                     <option>Pending</option>
//                     <option>Assigned</option>
//                     <option>Completed</option>
//                   </Form.Select>
//                 </td>

//                 <td style={{ minWidth: "140px" }}>
//                   <div className="d-grid gap-2">
//                     <Button
//                       variant="outline-primary"
//                       size="sm"
//                       onClick={() => handleView(req)}
//                     >
//                       <i className="bi bi-eye"></i> View
//                     </Button>
//                     <Button
//                       variant="outline-warning"
//                       size="sm"
//                       onClick={() => handleRemarks(req)}
//                     >
//                       <i className="bi bi-plus-circle"></i> Remarks
//                     </Button>
//                   </div>
//                 </td>



//               </tr>
//             ))
//           )}
//         </tbody>

//       </Table>
//       {/* View Modal */}
//       <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Repair Request Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedRequest && (
//             <>
//               {/* Request Details Table */}
//               <table className="table table-bordered">
//                 <tbody>
//                   <tr>
//                     <th>ID</th>
//                     <td>{selectedRequest.id}</td>
//                   </tr>
//                   <tr>
//                     <th>Date</th>
//                     <td>{selectedRequest.date}</td>
//                   </tr>
//                   <tr>
//                     <th>Requested By</th>
//                     <td>{selectedRequest.requestFrom}</td>
//                   </tr>
//                   <tr>
//                     <th>Details</th>
//                     <td>{selectedRequest.details}</td>
//                   </tr>
//                   <tr>
//                     <th>Type</th>
//                     <td>{selectedRequest.type}</td>
//                   </tr>
//                   <tr>
//                     <th>Status</th>
//                     <td>{selectedRequest.status}</td>
//                   </tr>
//                   <tr>
//                     <th>Assigned To</th>
//                     <td>{selectedRequest.assignedTo || 'Not Assigned'}</td>
//                   </tr>
//                   {selectedRequest.fileUrl && (
//                     <tr>
//                       <th>Attachment</th>
//                       <td>
//                         <a href={selectedRequest.fileUrl} target="_blank" rel="noopener noreferrer">
//                           View File
//                         </a>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>

//               {/* Remarks Section */}
//               <h5 className="mt-4">Remarks</h5>
//               {remarksList.length === 0 ? (
//                 <p className="text-muted">No remarks added yet.</p>
//               ) : (
//                 <div className="table-responsive">
//                   <table className="table table-striped table-bordered">
//                     <thead>
//                       <tr>
//                         <th>#</th>
//                         <th>Entered By</th>
//                         <th>Remark</th>
//                         <th>Date</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {remarksList.map((remark, index) => (
//                         <tr key={index}>
//                           <td>{index + 1}</td>
//                           <td>{remark.enteredBy}</td>
//                           <td>{remark.text}</td>
//                           <td>{new Date(remark.date).toLocaleString()}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
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


//       {/* Remarks Modal */}
//       <Modal show={showRemarksModal} onHide={() => setShowRemarksModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Remarks - Request ID: {selectedRequest?.id}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>


//           {/* Add New Remark */}
//           <Form.Group controlId="newRemark">
//             <Form.Label>Add New Remark</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={2}
//               placeholder="Type your remark here..."
//               value={newRemark}
//               onChange={(e) => setNewRemark(e.target.value)}
//             />
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowRemarksModal(false)}>Close</Button>
//           <Button variant="primary" onClick={handleAddRemark}>Add Remark</Button>
//         </Modal.Footer>
//       </Modal>


//     </Container>

//   );
// }

// export default StaffRepairRequestList;
