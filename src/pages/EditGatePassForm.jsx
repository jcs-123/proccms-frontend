import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditGatePassForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: "",
    type: "",
    department: "",
    issuedTo: "",
    purpose: "",
    vehicleType: "",
    vehicleRegNo: "",
  });

  const [items, setItems] = useState([""]);

  // Fetch existing data on mount
  useEffect(() => {
    axios.get(`http://localhost:5000/api/gatepass/${id}`)
      .then(res => {
        const data = res.data;
        setFormData({
          date: data.date.slice(0, 10), // format to yyyy-mm-dd for input type="date"
          type: data.type,
          department: data.department,
          issuedTo: data.issuedTo,
          purpose: data.purpose,
          vehicleType: data.vehicleType || "",
          vehicleRegNo: data.vehicleRegNo || "",
        });
        setItems(data.items.length ? data.items : [""]);
      })
      .catch(err => {
        console.error("Failed to load gate pass for editing", err);
        alert("Failed to load gate pass data");
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    setItems([...items, ""]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedGatePass = { ...formData, items };

    try {
      await axios.put(`http://localhost:5000/api/gatepass/${id}`, updatedGatePass);
      alert("Gate Pass updated successfully!");
      navigate("/gatepass"); // redirect to list after update
    } catch (error) {
      alert("Error updating Gate Pass");
      console.error(error);
    }
  };

  return (
    <div className="gatepass-container" style={{ padding: "30px", marginTop: "50px" }}>
      <h4>Edit Gate Pass</h4>
      <Form onSubmit={handleSubmit}>
        {/* Same form structure as NewGatePassForm, just populated */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label>Date*</Form.Label>
            <Form.Control type="date" name="date" value={formData.date} onChange={handleChange} />
          </Col>
          <Col md={4}>
            <Form.Label>Type*</Form.Label>
            <Form.Select name="type" value={formData.type} onChange={handleChange}>
              <option value="">---select----</option>
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Label>Department</Form.Label>
            <Form.Select name="department" value={formData.department} onChange={handleChange}>
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

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Issued To*</Form.Label>
            <Form.Control type="text" name="issuedTo" value={formData.issuedTo} onChange={handleChange} />
          </Col>
          <Col md={6}>
            <Form.Label>Purpose*</Form.Label>
            <Form.Control type="text" name="purpose" value={formData.purpose} onChange={handleChange} />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Vehicle Type</Form.Label>
            <Form.Control type="text" name="vehicleType" value={formData.vehicleType} onChange={handleChange} />
          </Col>
          <Col md={6}>
            <Form.Label>Vehicle Reg. No.</Form.Label>
            <Form.Control type="text" name="vehicleRegNo" value={formData.vehicleRegNo} onChange={handleChange} />
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Items*</Form.Label>
          {items.map((item, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
              <Form.Control
                type="text"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                style={{ maxWidth: "400px" }}
              />
              {items.length > 1 && (
                <Button variant="danger" size="sm" onClick={() => handleRemoveItem(index)} style={{ marginLeft: "8px" }}>
                  Delete
                </Button>
              )}
            </div>
          ))}
          <a href="#" className="text-success" onClick={handleAddItem}>
            + Add
          </a>
        </Form.Group>

        <Button type="submit" variant="success" className="me-2">Update</Button>
        <Button variant="secondary" onClick={() => navigate(`/gate-pass/print/${id}`)}>Print</Button>
      </Form>
    </div>
  );
}

export default EditGatePassForm;
