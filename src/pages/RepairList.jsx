import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Pagination } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { Modal } from 'react-bootstrap';
import * as XLSX from "xlsx";
import axios from 'axios';
import { useLocation } from 'react-router-dom';




function RepairList() {
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        status: '--- All ---',
        assignedPerson: '--- select ---'
    });

    const [requests, setRequests] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showRemarksModal, setShowRemarksModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [remarks, setRemarks] = useState("");


    const [allRemarksModal, setAllRemarksModal] = useState(false);
    const [allRemarks, setAllRemarks] = useState([]);
    const [acknowledgedRemarks, setAcknowledgedRemarks] = useState([]);

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const urlFilter = params.get("filter"); // "assigned" or "pending"



    const username = localStorage.getItem("name");
    const role = localStorage.getItem("role");



    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchRequests();
        fetchStaff();
    }, [urlFilter]);

    const fetchStaff = async () => {
        try {
            const res = await fetch("https://proccms-backend.onrender.com/api/staff");
            const data = await res.json();
            const formatted = data.map(staff => staff.name);
            setStaffList(["--- select ---", ...formatted]);
        } catch (err) {
            console.error("Error fetching staff list", err);
        }
    };

    const handleAllRemarksClick = async () => {
        try {
            const res = await fetch(`https://proccms-backend.onrender.com/api/repair-requests/all-remarks`);
            if (!res.ok) throw new Error("Failed to fetch all remarks");
            const data = await res.json();
            setAllRemarks(data);
            setAllRemarksModal(true);
        } catch (err) {
            alert(err.message);
        }
    };





    const fetchRequests = async () => {
        try {
            const params = new URLSearchParams();
            if (role !== "admin") params.append("username", username);
            params.append("role", role);

            if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
            if (filters.dateTo) params.append("dateTo", filters.dateTo);
            if (filters.status && filters.status !== "--- All ---") params.append("status", filters.status);
            if (filters.assignedPerson && filters.assignedPerson !== "--- select ---") params.append("assignedTo", filters.assignedPerson);

            const res = await fetch(`https://proccms-backend.onrender.com/api/repair-requests?${params}`);
            if (!res.ok) throw new Error("Failed to fetch repair requests");

            let data = await res.json();

            if (urlFilter === "assigned") {
                data = data.filter(r => r.assignedTo && r.status !== "Completed");
            } else if (urlFilter === "pending") {
                data = data.filter(r => r.status === "Pending");
            }

            const mappedData = data.map(req => ({
                id: req._id,
                date: new Date(req.createdAt).toLocaleString(),
                requestFrom: `${req.username || 'Unknown'} (${req.department || '--'})`,
                department: req.department || '--',
                email: req.email || '--',
                mobile: req.phone || '--',
                details: req.description,
                type: req.isNewRequirement ? "New Requirement" : "Repair Request",
                fileUrl: req.fileUrl ? `https://proccms-backend.onrender.com${req.fileUrl}` : "https://via.placeholder.com/20",
                assignedTo: req.assignedTo || "--- select ---",
                status: req.status || "Pending",
                isVerified: req.isVerified || false,
                completedAt: req.completedAt ? new Date(req.completedAt).toLocaleString() : null,
                remarks: req.remarks || [],
            }));

            setRequests(mappedData);
        } catch (error) {
            alert(error.message);
        }
    };
    const handleAssignChange = async (id, newAssignedTo) => {
        try {
            console.log("🔄 Assign change triggered");
            console.log("🆔 Request ID:", id);
            console.log("👤 New AssignedTo value:", newAssignedTo);

            // Update state optimistically
            setRequests(prev =>
                prev.map(req =>
                    req.id === id
                        ? {
                            ...req,
                            assignedTo: newAssignedTo,
                            status:
                                newAssignedTo !== "--- select ---" && req.status === "Pending"
                                    ? "Assigned"
                                    : req.status,
                        }
                        : req
                )
            );
            console.log("📝 State updated optimistically with assignedTo:", newAssignedTo);

            // API call
            console.log("🌐 Sending PATCH request to backend...");
            const response = await fetch(
                `https://proccms-backend.onrender.com/api/repair-requests/${id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        assignedTo: newAssignedTo,
                        status: newAssignedTo !== "--- select ---" ? "Assigned" : undefined,
                    }),
                }
            );

            console.log("📡 Backend response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Backend error response:", errorData);
                throw new Error(errorData.message || "Failed to update assigned person");
            }

            const result = await response.json();
            console.log("✅ Backend update success:", result);

            if (newAssignedTo !== "--- select ---") {
                console.log("📨 Showing success toast for staff:", newAssignedTo);
                toast.success(
                    <div>
                        <p>Request assigned to <strong>{newAssignedTo}</strong></p>
                        <p>Notification email has been sent.</p>
                    </div>
                );
            }
            return result;
        } catch (err) {
            console.error("❌ Assignment error caught:", err);
            toast.error(
                <div>
                    <p>Assignment failed!</p>
                    <p>{err.message}</p>
                </div>
            );
            console.log("🔄 Refreshing requests after error...");
            fetchRequests(); // Refresh data
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const updateData = { status: newStatus };

            if (newStatus === "Completed") {
                updateData.completedAt = new Date(); // send current date to backend
            }

            setRequests(prev =>
                prev.map(req =>
                    req.id === id
                        ? { ...req, status: newStatus, completedAt: newStatus === "Completed" ? new Date().toLocaleString() : req.completedDate }
                        : req
                )
            );
            const res = await fetch(`https://proccms-backend.onrender.com/api/repair-requests/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData),
            });
            if (!res.ok) throw new Error("Failed to update status");
        } catch (err) {
            alert(err.message);
            fetchRequests();
        }
    };
    const handleVerify = async (id) => {
        try {
            setRequests(prev =>
                prev.map(req =>
                    req.id === id ? { ...req, isVerified: true } : req
                )
            );
            const res = await fetch(`https://proccms-backend.onrender.com/api/repair-requests/${id}/verify`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isVerified: true }),
            });

            if (!res.ok) throw new Error("Failed to verify request");

            toast.success("Request verified successfully!");
        } catch (err) {
            toast.error("Verification failed: " + err.message);
            fetchRequests();
        }
    };


    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };


    const handleViewClick = (req) => {
        setSelectedRequest(req);
        setShowViewModal(true);
    };


    const handleRemarksClick = (req) => {
        setSelectedRequest(req);
        // If you want to fetch remarks from backend here, you can do it, for now we keep it empty or previous value
        setRemarks("");
        setShowRemarksModal(true);
    };


    const handleAcknowledge = async (index) => {
        const remark = allRemarks[index];

        try {
            await axios.patch(`https://proccms-backend.onrender.com/api/repair-requests/${remark.requestId}/remarks/${remark._id}/mark-seen`);

            const updatedRemarks = [...allRemarks];
            updatedRemarks[index].seen = true;
            setAllRemarks(updatedRemarks);

            toast.success("Marked as seen");
        } catch (error) {
            console.error("Error marking as seen:", error.response?.data || error.message);
            toast.error("Failed to mark as seen");
        }
    };


    const handleSaveRemarks = async () => {
        try {
            const enteredBy = localStorage.getItem("name") || "Admin";
            const userRole = localStorage.getItem("role"); // Get user role

            const res = await fetch(`https://proccms-backend.onrender.com/api/repair-requests/${selectedRequest.id}/remarks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: remarks,
                    enteredBy,
                    userRole // Send user role to backend
                }),
            });

            if (!res.ok) throw new Error("Failed to save remarks");

            // If admin is adding the remark, update status to "Refer Remark"
            if (userRole === "admin") {
                await fetch(`https://proccms-backend.onrender.com/api/repair-requests/${selectedRequest.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: "Refer Remark"
                    }),
                });

                // Update local state
                setRequests(prev =>
                    prev.map(req =>
                        req.id === selectedRequest.id
                            ? { ...req, status: "Refer Remark" }
                            : req
                    )
                );

                if (selectedRequest) {
                    setSelectedRequest(prev => ({
                        ...prev,
                        status: "Refer Remark"
                    }));
                }
            }

            toast.success("Remarks saved successfully!");
            setShowRemarksModal(false);
            fetchRequests(); // Refresh the list

            // Also update the selected request in view modal
            if (selectedRequest) {
                const updatedRequest = await res.json();
                setSelectedRequest(prev => ({
                    ...prev,
                    remarks: updatedRequest.remarks,
                    ...(userRole === "admin" && { status: "Refer Remark" }) // Add status if admin
                }));
            }
        } catch (err) {
            toast.error("Error saving remarks: " + err.message);
        }
    };
    
    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = requests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(requests.length / itemsPerPage);

    const renderPagination = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5; // Maximum number of page buttons to show at once

        // Calculate the range of pages to display
        let startPage, endPage;
        if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages is less than max visible
            startPage = 1;
            endPage = totalPages;
        } else {
            // Calculate start and end pages to show
            const half = Math.floor(maxVisiblePages / 2);
            if (currentPage <= half + 1) {
                startPage = 1;
                endPage = maxVisiblePages;
            } else if (currentPage >= totalPages - half) {
                startPage = totalPages - maxVisiblePages + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - half;
                endPage = currentPage + half;
            }
        }

        // Generate page numbers
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }

        return (
            <Pagination className="justify-content-center">
                <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                />
                <Pagination.Prev
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                />

                {startPage > 1 && (
                    <>
                        <Pagination.Item onClick={() => setCurrentPage(1)}>1</Pagination.Item>
                        {startPage > 2 && <Pagination.Ellipsis disabled />}
                    </>
                )}

                {pageNumbers}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <Pagination.Ellipsis disabled />}
                        <Pagination.Item onClick={() => setCurrentPage(totalPages)}>
                            {totalPages}
                        </Pagination.Item>
                    </>
                )}

                <Pagination.Next
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                />
                <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                />
            </Pagination>
        );
    };
    const exportToExcel = () => {
        // Prepare data you want to export (here all filtered requests)
        const dataToExport = requests.map((req, index) => ({
            "Sl No": index + 1,
            Date: req.date,
            "Request From": req.requestFrom,
            "Request Details": req.details,
            "New/Repair": req.type,
            "Assigned To": req.assignedTo,
            Status: req.status,
            Verified: req.isVerified ? "Yes" : "No",
            Remarks: req.remarks.join("; "), // assuming remarks is an array
        }));

        // Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Repair Requests");

        // Generate Excel file and trigger download
        XLSX.writeFile(workbook, "RepairRequests.xlsx");
    };
    return (
        <Container fluid className="p-4 mt-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <h5 className="mb-4 fw-bold">Repair Request List {urlFilter ? `- ${urlFilter.charAt(0).toUpperCase() + urlFilter.slice(1)}` : ''}</h5>

            {/* Filter Section */}
            <Row className="g-3 align-items-end">
                <Col md={3}>
                    <Form.Group controlId="dateFrom">
                        <Form.Label>Date from</Form.Label>
                        <Form.Control type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
                    </Form.Group>
                </Col>

                <Col md={3}>
                    <Form.Group controlId="dateTo">
                        <Form.Label>Date to</Form.Label>
                        <Form.Control type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
                    </Form.Group>
                </Col>
                <Col md={2}>
                    <Form.Group controlId="status">
                        <Form.Label>Status</Form.Label>
                        <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                            <option>--- All ---</option>
                            <option>Pending</option>
                            <option>Assigned</option>
                            <option>Completed</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group controlId="assignedPerson">
                        <Form.Label>Assigned Person</Form.Label>
                        <Form.Select name="assignedPerson" value={filters.assignedPerson} onChange={handleFilterChange}>
                            {staffList.map((name, idx) => (
                                <option key={idx} value={name}>{name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={1}>
                    <Button variant="success" className="w-100" onClick={fetchRequests}>Search</Button>
                </Col>
                <Col md={2}>
                    <Button variant="danger" className="w-100" onClick={exportToExcel}>
                        Export to Excel
                    </Button>
                </Col>
                <Col xs={12} sm={3} className="mt-2 mt-sm-0">
                    <Button variant="primary" className="w-100" onClick={handleAllRemarksClick}>
                        📝All Remarks
                    </Button>

                </Col>
            </Row>
            {/* Table */}
            <Row className="mt-4">
                <Col>
                    <Table responsive bordered hover size="sm">
                        <thead className="table-light text-center align-middle">
                            <tr>
                                <th>Sl No</th>
                                <th>Date</th>
                                <th>Request From</th>
                                <th>Request Details</th>
                                <th>New/Repair</th>
                                <th>File</th>
                                <th>Assigned to</th>
                                <th>Status</th>
                                <th>Verification</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-center align-middle">
                            {currentItems.length === 0 ? (
                                <tr><td colSpan={10}>No repair requests found.</td></tr>
                            ) : currentItems.map((req, idx) => (
                                <tr key={req.id}>
                                    <td>{indexOfFirstItem + idx + 1}</td>
                                    <td>{req.date}</td>
                                    <td
                                        style={{
                                            minWidth: "150px",        // minimum width for spacing
                                            maxWidth: "200px",        // cap the width
                                            padding: "8px",           // inner spacing
                                            fontSize: "15px",         // font size
                                            fontWeight: "bold",       // makes text bold
                                            wordBreak: "break-word",  // wrap long text
                                            textAlign: "center",      // or "left" if preferred
                                        }}
                                    >
                                        {req.requestFrom}
                                    </td>

                                    <td
                                        style={{
                                            whiteSpace: "normal",
                                            wordBreak: "break-word",
                                            maxWidth: "400px",
                                            minWidth: "300px",
                                            padding: "8px",             // overall padding
                                            paddingBottom: "23px",      // extra space below the text
                                            fontSize: "15px",
                                            fontWeight: "bold",
                                            lineHeight: "1.4",
                                            textAlign: "justify",
                                        }}
                                    >
                                        {req.details}
                                    </td>


                                    <td>{req.type}</td>
                                    <td>
                                        <a href={req.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <img src={req.fileUrl} alt="file" style={{ maxWidth: 40, cursor: 'pointer' }} />
                                        </a>
                                    </td>

                                    <td style={{ minWidth: "110px", padding: "8px", textAlign: "center" }}>
                                        {req.assignedTo !== "--- select ---" && (
                                            <strong className="text-uppercase d-block mb-1">{req.assignedTo}</strong>
                                        )}
                                        <Form.Select
                                            size="sm"
                                            value={req.assignedTo}
                                            onChange={(e) => handleAssignChange(req.id, e.target.value)}
                                        >
                                            {staffList.map((name, idx) => (
                                                <option key={idx} value={name}>{name}</option>
                                            ))}
                                        </Form.Select>
                                    </td>

                                    <td style={{ minWidth: "110px", padding: "8px", textAlign: "center" }}>
                                        <span
                                            className={`badge px-2 py-1 mb-2 rounded text-white fw-semibold ${req.status === 'Pending'
                                                ? 'bg-danger'
                                                : req.status === 'Assigned'
                                                    ? 'bg-warning text-dark'
                                                    : req.status === 'Completed'
                                                        ? 'bg-success'
                                                        : req.status === 'Duplicate'
                                                            ? 'bg-warning text-dark'
                                                            : req.status === 'Refer Remark'
                                                                ? 'bg-primary'
                                                                : 'bg-secondary'
                                                }`}
                                        >
                                            {req.status}
                                        </span>
                                        <Form.Select
                                            size="sm"
                                            className="mt-1"
                                            value={req.status}
                                            onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                        >
                                            <option>--Select--</option>
                                            <option>Duplicate</option>
                                            <option>Refer Remark</option>
                                        </Form.Select>
                                    </td>

                                    <td>
                                        {req.status === "Completed" ? (
                                            req.isVerified ? (
                                                <Button size="sm" variant="success">Verified</Button>
                                            ) : (
                                                <Button size="sm" variant="warning" onClick={() => handleVerify(req.id)}>Verify</Button>
                                            )
                                        ) : (
                                            <span className="text-muted">--</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column gap-1">

                                            <div className="d-flex flex-column gap-1">
                                                <Button size="sm" variant="outline-primary" onClick={() => handleViewClick(req)}>👁️ View</Button>
                                                <Button size="sm" variant="outline-warning" onClick={() => handleRemarksClick(req)}>📝 Remarks</Button>
                                            </div>

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>


                    {/* <Table responsive bordered hover size="sm">
                        <thead className="table-light text-center align-middle">
                            <tr>
                                <th>Sl No</th>
                                <th>Date</th>
                                <th>Request From</th>
                                <th>Request Details</th>
                                <th>New/Repair</th>
                                <th>File</th>
                                <th>Assigned to</th>
                                <th>Status</th>
                                <th>Verification</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-center align-middle">
                            {currentItems.length === 0 ? (
                                <tr><td colSpan={10}>No repair requests found.</td></tr>
                            ) : currentItems.map((req, idx) => (
                                <tr key={req.id}>
                                    <td>{indexOfFirstItem + idx + 1}</td>
                                    <td>{req.date}</td>
                                    <td>{req.requestFrom}</td>
                                    <td style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxWidth: "250px", textAlign: "left" }}>
                                        {req.details}
                                    </td>
                                    <td>{req.type}</td>
                                    <td><img src={req.fileUrl} alt="file" style={{ maxWidth: 40 }} /></td>
                                    <td>
                                        {req.assignedTo !== "--- select ---" && (
                                            <strong className="text-uppercase">{req.assignedTo}</strong>
                                        )}
                                        <Form.Select
                                            size="sm"
                                            className="mt-2"
                                            value={req.assignedTo}
                                            onChange={(e) => handleAssignChange(req.id, e.target.value)}
                                        >
                                            {staffList.map((name, idx) => (
                                                <option key={idx} value={name}>{name}</option>
                                            ))}
                                        </Form.Select>
                                    </td>
                                    <td>
                                        <span
                                            className={`badge px-2 py-1 mb-3 rounded text-white fw-semibold ${req.status === 'Pending'
                                                ? 'bg-danger'
                                                : req.status === 'Assigned'
                                                    ? 'bg-warning text-dark'
                                                    : req.status === 'Completed'
                                                        ? 'bg-success'
                                                        : req.status === 'Duplicate'
                                                            ? 'bg-warning text-dark'
                                                            : req.status === 'Refer Remark'
                                                                ? 'bg-primary'
                                                                : 'bg-secondary'
                                                }`}
                                        >
                                            {req.status}
                                        </span>
                                        <Form.Select
                                            size="sm"
                                            value={req.status}
                                            onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                        >
                                            <option>--Select--</option>
                                            <option>Duplicate</option>
                                            <option>Refer Remark</option>
                                        </Form.Select>
                                    </td>
                                    <td>
                                        {req.status === "Completed" ? (
                                            req.isVerified ? (
                                                <Button size="sm" variant="success">Verified</Button>
                                            ) : (
                                                <Button size="sm" variant="warning" onClick={() => handleVerify(req.id)}>Verify</Button>
                                            )
                                        ) : (
                                            <span className="text-muted">--</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column gap-1">

                                            <div className="d-flex flex-column gap-1">
                                                <Button size="sm" variant="outline-primary" onClick={() => handleViewClick(req)}>👁️ View</Button>
                                                <Button size="sm" variant="outline-warning" onClick={() => handleRemarksClick(req)}>📝 Remarks</Button>
                                            </div>

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table> */}




                    <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Repair Request Details</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            {selectedRequest ? (
                                <>
                                    {/* Requester Details */}
                                    <h5 className="mb-3">Requester Information</h5>
                                    <Table bordered>
                                        <tbody>
                                            <tr>
                                                <th>Name</th>
                                                <td>{selectedRequest.requestFrom}</td>
                                                <th>Department</th>
                                                <td>{selectedRequest.department}</td>
                                            </tr>
                                            <tr>
                                                <th>Email</th>
                                                <td>{selectedRequest.email}</td>
                                                <th>Mobile</th>
                                                <td>{selectedRequest.mobile}</td>
                                            </tr>
                                            <tr>
                                                <th>Requested Date</th>
                                                <td>{selectedRequest.date}</td>
                                                <th>Completed Date</th>
                                                <td>{selectedRequest.completedAt || '---'}</td>
                                            </tr>
                                        </tbody>
                                    </Table>

                                    {/* Request Details */}
                                    <h5 className="mt-4 mb-2">Request Description</h5>
                                    <div className="p-2 border rounded bg-light">
                                        {selectedRequest.details}
                                    </div>

                                    {/* Optional File */}
                                    {selectedRequest.fileUrl && (
                                        <div className="mt-4">
                                            <h6>Attachment</h6>
                                            <a
                                                href={selectedRequest.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                View Attached File
                                            </a>
                                        </div>
                                    )}


                                    {/* Remarks Table */}
                                    <div className="mt-4">
                                        <h5 className="mb-3">Remarks History</h5>
                                        <Table bordered hover size="sm">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Sl No.</th>
                                                    <th>Remark</th>
                                                    <th>Entered By</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedRequest.remarks && selectedRequest.remarks.length > 0 ? (
                                                    selectedRequest.remarks.map((remark, index) => (
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>{remark.text}</td>
                                                            <td>{remark.enteredBy}</td>
                                                            <td>{new Date(remark.date).toLocaleString()}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="text-center text-muted">No remarks found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </>
                            ) : (
                                <p>Loading...</p>
                            )}
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Remarks Modal */}
                    <Modal show={showRemarksModal} onHide={() => setShowRemarksModal(false)} size="lg" centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Add Remark for Request #{selectedRequest?.id}</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <div className="mb-3">
                                <h6>Add New Remark</h6>
                                <Form.Group>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Enter your remark here"
                                    />
                                </Form.Group>
                            </div>

                            <div className="mt-4">
                                <h6>Previous Remarks</h6>
                                {selectedRequest?.remarks?.length > 0 ? (
                                    <Table bordered size="sm">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Entered By</th>
                                                <th>Remark</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedRequest.remarks.map((remark, index) => (
                                                <tr key={index}>
                                                    <td>{new Date(remark.date).toLocaleString()}</td>
                                                    <td>{remark.enteredBy}</td>
                                                    <td>{remark.text}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <p className="text-muted">No remarks yet</p>
                                )}
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowRemarksModal(false)}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={handleSaveRemarks}>
                                Save Remark
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={allRemarksModal} onHide={() => setAllRemarksModal(false)} centered size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>All Remarks</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            {allRemarks.length === 0 ? (
                                <p className="text-center text-muted">No remarks found.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle border shadow-sm rounded">
                                        <thead className="table-primary">
                                            <tr>
                                                <th>#</th>
                                                <th>Request ID</th>
                                                <th>Entered By</th>
                                                <th>Remark</th>
                                                <th>Date</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allRemarks.map((r, i) => (
                                                <tr key={i}>
                                                    <td>{i + 1}</td>
                                                    <td>{r.requestId}</td>
                                                    <td>{r.enteredBy}</td>
                                                    <td>{r.text}</td>
                                                    <td>{new Date(r.date).toLocaleString()}</td>
                                                    <td>
                                                        {r.seen ? (
                                                            <Button variant="outline-info" size="sm" className="rounded-pill px-3" disabled>
                                                                Seen 👁️
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="info"
                                                                size="sm"
                                                                className="rounded-pill px-3"
                                                                onClick={() => handleAcknowledge(i)}
                                                            >
                                                                Mark as Seen
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setAllRemarksModal(false)}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>


                    {/* Pagination */}
                    {renderPagination()}
                </Col>
            </Row>
            <ToastContainer autoClose={1000} position="top-center" />
        </Container>
    );
}
export default RepairList;


