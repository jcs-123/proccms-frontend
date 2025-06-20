import React, { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function NewGatePassForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0], // Default to today's date
    type: "",
    department: "",
    issuedTo: "",
    purpose: "",
    vehicleType: "",
    vehicleRegNo: "",
  });

  const [items, setItems] = useState([""]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.issuedTo) newErrors.issuedTo = "Issued To is required";
    if (!formData.purpose) newErrors.purpose = "Purpose is required";
    if (!formData.vehicleType) newErrors.vehicleType = "Vehicle Type is required";
    if (!formData.vehicleRegNo) newErrors.vehicleRegNo = "Vehicle Reg. No. is required";

    if (items.length === 0 || items.every(item => item.trim() === "")) {
      newErrors.items = "At least one item is required";
    } else {
      items.forEach((item, idx) => {
        if (!item.trim()) {
          newErrors[`item_${idx}`] = "Item cannot be empty";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
    setErrors({ ...errors, [`item_${index}`]: null, items: null });
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    setItems([...items, ""]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    const newErrors = { ...errors };
    delete newErrors[`item_${index}`];
    setErrors(newErrors);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return null;
    }

    const gatePassData = { ...formData, items };
    try {
      const response = await axios.post("http://localhost:5000/api/gatepass", gatePassData);
      alert("Gate Pass saved successfully!");
      return response.data;
    } catch (error) {
      alert("Error saving Gate Pass");
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const savedGatePass = await handleSave();
      if (savedGatePass) {
        navigate("/gatepass");
      }
    } catch {}
  };

  const handleSaveAndPrint = async (e) => {
    e.preventDefault();
    try {
      const savedGatePass = await handleSave();
      if (savedGatePass && savedGatePass._id) {
        navigate("/gatepass");
        window.open(`/gate-pass/print/${savedGatePass._id}`, "_blank");
      }
    } catch {}
  };

  return (
    <div className="gatepass-container" style={{ padding: "30px", marginTop: "50px" }}>
      <h4>Gate Pass</h4>
      <Form onSubmit={handleSubmit} noValidate>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label>Date*</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              isInvalid={!!errors.date}
            />
            <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
          </Col>
          <Col md={4}>
            <Form.Label>Type*</Form.Label>
            <Form.Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              isInvalid={!!errors.type}
            >
              <option value="">---select----</option>
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.type}</Form.Control.Feedback>
          </Col>
          <Col md={4}>
            <Form.Label>Department*</Form.Label>
            <Form.Select
              name="department"
              value={formData.department}
              onChange={handleChange}
              isInvalid={!!errors.department}
            >
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
            <Form.Control.Feedback type="invalid">{errors.department}</Form.Control.Feedback>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Issued To*</Form.Label>
            <Form.Control
              type="text"
              name="issuedTo"
              value={formData.issuedTo}
              onChange={handleChange}
              isInvalid={!!errors.issuedTo}
            />
            <Form.Control.Feedback type="invalid">{errors.issuedTo}</Form.Control.Feedback>
          </Col>
          <Col md={6}>
            <Form.Label>Purpose*</Form.Label>
            <Form.Control
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              isInvalid={!!errors.purpose}
            />
            <Form.Control.Feedback type="invalid">{errors.purpose}</Form.Control.Feedback>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Vehicle Type*</Form.Label>
            <Form.Control
              type="text"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              isInvalid={!!errors.vehicleType}
            />
            <Form.Control.Feedback type="invalid">{errors.vehicleType}</Form.Control.Feedback>
          </Col>
          <Col md={6}>
            <Form.Label>Vehicle Reg. No.*</Form.Label>
            <Form.Control
              type="text"
              name="vehicleRegNo"
              value={formData.vehicleRegNo}
              onChange={handleChange}
              isInvalid={!!errors.vehicleRegNo}
            />
            <Form.Control.Feedback type="invalid">{errors.vehicleRegNo}</Form.Control.Feedback>
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
                isInvalid={!!errors[`item_${index}`]}
              />
              <Form.Control.Feedback type="invalid">{errors[`item_${index}`]}</Form.Control.Feedback>
              {items.length > 1 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                  style={{ marginLeft: "8px" }}
                >
                  Delete
                </Button>
              )}
            </div>
          ))}
          {errors.items && <div className="text-danger mb-2">{errors.items}</div>}
          <a href="#" className="text-success" onClick={handleAddItem}>
            + Add
          </a>
        </Form.Group>

        <Button type="submit" variant="success" className="me-2">
          Save
        </Button>
        <Button variant="secondary" onClick={handleSaveAndPrint}>
          Save & Print
        </Button>
      </Form>
    </div>
  );
}

export default NewGatePassForm;
