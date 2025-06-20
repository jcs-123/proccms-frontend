import React, { useEffect, useState } from "react";
import { Button, Form, Row, Col, Table, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./GatePass.css";

function GatePass() {
    const navigate = useNavigate();
    const [gatePasses, setGatePasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [issuedDateFrom, setIssuedDateFrom] = useState("");
    const [issuedDateTo, setIssuedDateTo] = useState("");
    const [type, setType] = useState("");
    const [department, setDepartment] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    const fetchGatePasses = async () => {
        try {
            const res = await axios.get("https://proccms-backend.onrender.com/api/gatepass");

            // Sort by date descending (latest first)
            const sortedData = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));

            setGatePasses(sortedData);
        } catch (err) {
            console.error("Failed to fetch gate passes", err);
        }
    };


    useEffect(() => {
        fetchGatePasses();
    }, []);

    const handleNewGatePassClick = () => {
        navigate("/gate-pass/new");
    };

    const handleEdit = (id) => {
        navigate(`/gate-pass/edit/${id}`);
    };

    const handlePrint = (id) => {
        window.open(`/gate-pass/print/${id}`, "_blank");
    };

    const filteredPasses = gatePasses.filter((pass) => {
        const issuedToMatch = pass.issuedTo.toLowerCase().includes(searchTerm.toLowerCase());
        const passDate = new Date(pass.date);
        const fromDate = issuedDateFrom ? new Date(issuedDateFrom) : null;
        const toDate = issuedDateTo ? new Date(issuedDateTo) : null;
        const fromDateMatch = fromDate ? passDate >= fromDate : true;
        const toDateMatch = toDate ? passDate <= toDate : true;
        const typeMatch = type ? pass.type.toLowerCase() === type.toLowerCase() : true;
        const departmentMatch = department ? pass.department === department : true;
        return issuedToMatch && fromDateMatch && toDateMatch && typeMatch && departmentMatch;
    });

    const totalPages = Math.ceil(filteredPasses.length / entriesPerPage);
    const indexOfLastItem = currentPage * entriesPerPage;
    const indexOfFirstItem = indexOfLastItem - entriesPerPage;
    const currentEntries = filteredPasses.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }

        return (
            <Pagination className="justify-content-end">
                <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                />
                {pages}
                <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                />
            </Pagination>
        );
    };

    return (
        <div className="gatepass-container">
            <div className="gatepass-header">
                <h4>Gate Pass List</h4>
                <Button className="btn-primary" onClick={handleNewGatePassClick}>
                    + New Gate Pass
                </Button>
            </div>

            <div className="filter-section">
                <Form>
                    <Row>
                        <Col md={3}>
                            <Form.Label>Issued Date from</Form.Label>
                            <Form.Control
                                type="date"
                                value={issuedDateFrom}
                                onChange={(e) => setIssuedDateFrom(e.target.value)}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Label>Issued Date to</Form.Label>
                            <Form.Control
                                type="date"
                                value={issuedDateTo}
                                onChange={(e) => setIssuedDateTo(e.target.value)}
                            />
                        </Col>
                        <Col md={2}>
                            <Form.Label>Type</Form.Label>
                            <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="">---- Select ----</option>
                                <option>Temporary</option>
                                <option>Permanent</option>
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label>Department</Form.Label>
                            <Form.Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                                <option value="">--- Select ---</option>
                                <option>Office</option>
                                <option>Project Office</option>
                                <option>Computer Center</option>
                                <option>Civil Engineering</option>
                                <option>Computer Science and Engineering</option>
                                <option>Electronics and Communication Engineering</option>
                                <option>Electrical and Electronics Engineering</option>
                                <option>Mechanical Engineering</option>
                                <option>Basic Science and Humanities</option>
                                <option>Mechatronics</option>
                                <option>Library</option>
                                <option>Research and Development</option>
                                <option>Placement</option>
                                <option>Other</option>
                            </Form.Select>
                        </Col>
                    </Row>
                </Form>
            </div>

            <div className="search-pagination-bar mt-4 d-flex justify-content-between align-items-center">
                <div>
                    Show
                    <Form.Select
                        size="sm"
                        className="d-inline w-auto mx-2"
                        value={entriesPerPage}
                        onChange={(e) => {
                            setEntriesPerPage(parseInt(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </Form.Select>
                    entries
                </div>
                <div>
                    Search:
                    <Form.Control
                        type="text"
                        size="sm"
                        className="d-inline w-auto ms-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {renderPagination()}

            <div className="table-section mt-3">
                <Table striped bordered hover responsive className="gatepass-table mt-4">
                    <thead>
                        <tr>
                            <th>Sl No</th>
                            <th>Issued Date</th>
                            <th>Type</th>
                            <th>Department</th>
                            <th>Issued To</th>
                            <th>Purpose</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentEntries.length > 0 ? (
                            currentEntries.map((pass, index) => (
                                <tr key={pass._id}>
                                    <td>{indexOfFirstItem + index + 1}</td>
                                    <td>{new Date(pass.date).toLocaleDateString("en-GB")}</td>
                                    <td>{pass.type}</td>
                                    <td>{pass.department}</td>
                                    <td>{pass.issuedTo}</td>
                                    <td>{pass.purpose}</td>
                                    <td>
                                        <div className="d-grid gap-2">
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                onClick={() => handleEdit(pass._id)}
                                            >
                                                🖉 Edit
                                            </Button>
                                            <Button
                                                variant="outline-warning"
                                                size="sm"
                                                onClick={() => handlePrint(pass._id)}
                                            >
                                                🖨 Print
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">
                                    No results found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>

                {renderPagination()}
            </div>
        </div>
    );
}

export default GatePass;



// import React, { useEffect, useState } from "react";
// import { Button, Form, Row, Col, Table } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./GatePass.css";

// function GatePass() {
//   const navigate = useNavigate();
//   const [gatePasses, setGatePasses] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");

//   const fetchGatePasses = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/gatepass");
//       setGatePasses(res.data);
//     } catch (err) {
//       console.error("Failed to fetch gate passes", err);
//     }
//   };

//   useEffect(() => {
//     fetchGatePasses();
//   }, []);

//   const handleNewGatePassClick = () => {
//     navigate("/gate-pass/new");
//   };

//   const handleEdit = (id) => {
//    navigate(`/gate-pass/edit/${id}`);
//   };

//   const handlePrint = (id) => {
//     window.open(`/gate-pass/print/${id}`, "_blank");
//   };

//   const filteredPasses = gatePasses.filter((pass) =>
//     pass.issuedTo.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="gatepass-container">
//       <div className="gatepass-header">
//         <h4>Gate Pass List</h4>
//         <Button className="btn-primary" onClick={handleNewGatePassClick}>
//           + New Gate Pass
//         </Button>
//       </div>

//       <div className="filter-section">
//         <Form>
//           <Row>
//             <Col md={3}>
//               <Form.Label>Issued Date from</Form.Label>
//               <Form.Control type="date" />
//             </Col>
//             <Col md={3}>
//               <Form.Label>Issued Date to</Form.Label>
//               <Form.Control type="date" />
//             </Col>
//             <Col md={2}>
//               <Form.Label>Type</Form.Label>
//               <Form.Select>
//                 <option value="">---- Select ----</option>
//                 <option>Temporary</option>
//                 <option>Permanent</option>
//               </Form.Select>
//             </Col>
//             <Col md={3}>
//               <Form.Label>Department</Form.Label>
//               <Form.Select>
//                  <option value="">--- Select ---</option>
//               <option>Office</option>
//               <option>Project Office</option>
//               <option>Computer Center</option>
//               <option>Civil Engineering</option>
//               <option>Computer Science and Engineering</option>
//               <option>Electronics and Communication Engineering</option>
//               <option>Electrical and Electronics Engineering</option>
//               <option>Mechanical Engineering</option>
//               <option>Basic Science and Humanities</option>
//               <option>Mechatronics</option>
//               <option>Library</option>
//               <option>Research and Development</option>
//               <option>Placement</option>
//               <option>Other</option>
//               </Form.Select>
//             </Col>
//             <Col md={1} className="d-flex align-items-end">
//               <Button variant="primary" type="submit">Search</Button>
//             </Col>
//           </Row>
//         </Form>
//       </div>

//       <div className="search-pagination-bar mt-4 d-flex justify-content-between align-items-center">
//         <div>
//           Show
//           <Form.Select size="sm" className="d-inline w-auto mx-2">
//             <option>10</option>
//             <option>25</option>
//             <option>50</option>
//           </Form.Select>
//           entries
//         </div>
//         <div>
//           Search:
//           <Form.Control
//             type="text"
//             size="sm"
//             className="d-inline w-auto ms-2"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="table-section mt-3">
//         <Table striped bordered hover responsive>
//           <thead>
//             <tr>
//               <th>Sl No</th>
//               <th>Issued Date</th>
//               <th>Type</th>
//               <th>Department</th>
//               <th>Issued To</th>
//               <th>Purpose</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredPasses.length > 0 ? (
//               filteredPasses.map((pass, index) => (
//                 <tr key={pass._id}>
//                   <td>{index + 1}</td>
//                   <td>{new Date(pass.date).toLocaleDateString("en-GB")}</td>
//                   <td>{pass.type}</td>
//                   <td>{pass.department}</td>
//                   <td>{pass.issuedTo}</td>
//                   <td>{pass.purpose}</td>
//                   <td>
//                     <Button variant="success" size="sm" onClick={() => handleEdit(pass._id)} className="me-2">
//                       🖉 Edit
//                     </Button>
//                     <Button variant="outline-dark" size="sm" onClick={() => handlePrint(pass._id)}>
//                       🖨 Print
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="7" className="text-center">
//                   No results found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </Table>
//       </div>
//     </div>
//   );
// }

// export default GatePass;
