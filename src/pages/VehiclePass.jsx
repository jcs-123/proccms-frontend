import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Form,
  Row,
  Col,
  Table,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Vehicle.css";

const VehiclePassList = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState({
    dateFrom: "",
    dateTo: "",
    passNo: "",
  });

  const [vehicleList, setVehicleList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generalSearch, setGeneralSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchVehiclePasses();
  }, []);

 const fetchVehiclePasses = async () => {
  try {
    const res = await axios.get("https://proccms-backend.onrender.com/api/vehicles");
    if (Array.isArray(res.data)) {
      const sortedData = res.data.sort((a, b) => new Date(b.date) - new Date(a.date)); // 🔁 Latest first
      setVehicleList(sortedData);
      setFilteredList(sortedData);
    } else {
      console.error("Expected array, got:", res.data);
    }
  } catch (error) {
    console.error("Error fetching passes:", error);
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const { dateFrom, dateTo, passNo } = searchParams;

    let filtered = [...vehicleList];

    if (dateFrom) {
      filtered = filtered.filter((v) => new Date(v.date) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter((v) => new Date(v.date) <= new Date(dateTo));
    }

    if (passNo) {
      filtered = filtered.filter((v) =>
        v.passNo.toLowerCase().includes(passNo.toLowerCase())
      );
    }

    setFilteredList(filtered);
    setCurrentPage(1);
  };

  const handleGeneralSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setGeneralSearch(keyword);

    const result = vehicleList.filter(
      (item) =>
        item.passNo?.toLowerCase().includes(keyword) ||
        item.issuedTo?.toLowerCase().includes(keyword) ||
        item.classOrDept?.toLowerCase().includes(keyword) ||
        item.vehicleReg?.toLowerCase().includes(keyword) ||
        item.vehicleType?.toLowerCase().includes(keyword)
    );

    setFilteredList(result);
    setCurrentPage(1);
  };

  const handleNewPass = () => {
    navigate("/vehicle-pass/new");
  };

  const handleEdit = (passId) => {
    navigate(`/vehicle-pass/edit/${passId}`);
  };

  const handlePrint = (pass) => {
    const printContent = `
      <html>
        <head>
          <title>Vehicle Pass - ${pass.passNo}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            h2 {
              text-align: center;
              color: #2c3e50;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 30px;
            }
            td, th {
              border: 1px solid #ddd;
              padding: 10px;
              font-size: 14px;
            }
            th {
              background-color: #f5f5f5;
              text-align: left;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 13px;
              color: #666;
            }
              
          </style>
        </head>
        <body>
          <h2>Vehicle Pass</h2>
          <table>
            <tr><th>Pass No</th><td>${pass.passNo}</td></tr>
            <tr><th>Issued Date</th><td>${new Date(pass.date).toLocaleDateString()}</td></tr>
            <tr><th>Issued To</th><td>${pass.issuedTo || "-"}</td></tr>
            <tr><th>Class / Department</th><td>${pass.classOrDept || "-"}</td></tr>
            <tr><th>Vehicle Registration No.</th><td>${pass.vehicleReg}</td></tr>
            <tr><th>Vehicle Type</th><td>${pass.vehicleType}</td></tr>
            <tr><th>Authorization</th><td>${pass.authorization || "-"}</td></tr>
            <tr><th>RC Owner</th><td>${pass.rcOwner || "-"}</td></tr>
            <tr><th>Remarks</th><td>${pass.remarks || "None"}</td></tr>
          </table>
          <div class="footer">
            <p>This is a system-generated vehicle pass. No signature is required.</p>
          </div>
        </body>
      </html>
    `;
    const newWindow = window.open("", "", "width=800,height=600");
    newWindow.document.write(printContent);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <Container className="mt-5 py-4 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 text-primary">Vehicle Pass List</h4>
        <Button variant="primary" onClick={handleNewPass}>
         + New Vehicle Pass
        </Button>
      </div>

      <Form onSubmit={handleSearch} className="mb-4 border p-3 rounded shadow-sm bg-light">
        <Row className="gy-2 gx-3">
          <Col md={3}>
            <Form.Label>Issued Date From</Form.Label>
            <Form.Control
              type="date"
              name="dateFrom"
              value={searchParams.dateFrom}
              onChange={handleInputChange}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Issued Date To</Form.Label>
            <Form.Control
              type="date"
              name="dateTo"
              value={searchParams.dateTo}
              onChange={handleInputChange}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Pass No</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Pass No"
              name="passNo"
              value={searchParams.passNo}
              onChange={handleInputChange}
            />
          </Col>
          <Col md={3} className="d-flex align-items-end">
            <Button type="submit" variant="success" className="w-100">
              Search
            </Button>
          </Col>
        </Row>
      </Form>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Select
            style={{ width: "120px" }}
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </Form.Select>
        </Col>
        <Col md={6} className="text-end">
          <InputGroup className="w-50 ms-auto">
            <InputGroup.Text>Search</InputGroup.Text>
            <FormControl value={generalSearch} onChange={handleGeneralSearch} />
          </InputGroup>
        </Col>
      </Row>

      <Table bordered hover responsive className="custom-table shadow-sm">
        <thead className="table-primary text-center">
          <tr>
            <th>Sl No</th>
            <th>Issued Date</th>
            <th>Pass No</th>
            <th>Issued To</th>
            <th>Class/Department</th>
            <th>Vehicle Reg. No & Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="text-center">
                Loading...
              </td>
            </tr>
          ) : currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <tr key={item._id || index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>{item.passNo}</td>
                <td>{item.issuedTo}</td>
                <td>{item.classOrDept}</td>
                <td>{item.vehicleReg}, {item.vehicleType}</td>
                <td>
                  <div className="table-actions d-flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleEdit(item._id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePrint(item)}
                    >
                      Print
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No matching records found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <Button variant="secondary" onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button variant="secondary" onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
    </Container>
  );
};

export default VehiclePassList;
