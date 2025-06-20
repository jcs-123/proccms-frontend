import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';

function NewVehiclePassForm() {
  const [formData, setFormData] = useState({
    passNo: '',
    date: new Date().toISOString().split("T")[0],
    staffCode: '',
    issuedTo: '',
    classOrDept: '',
    rcOwner: '',
    rcNo: '',
    vehicleReg: '',
    vehicleType: '',
    licenseNo: '',
    authorization: '',
    remarks: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/vehicles', formData);
      alert("Vehicle pass saved successfully!");
      setFormData({
        passNo: '',
        date: new Date().toISOString().split("T")[0],
        staffCode: '',
        issuedTo: '',
        classOrDept: '',
        rcOwner: '',
        rcNo: '',
        vehicleReg: '',
        vehicleType: '',
        licenseNo: '',
        authorization: '',
        remarks: ''
      });
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to save vehicle pass.");
    }
  };

  return (
    <Container className="mt-5 pt-3">
      <Card className="shadow-sm">
        <Card.Body>
          <h4 className="text-primary fw-bold mb-4">Vehicle Pass</h4>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">Pass No<span className="text-danger">*</span></Form.Label>
                  <Form.Control name="passNo" value={formData.passNo} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">Date<span className="text-danger">*</span></Form.Label>
                  <Form.Control type="date" name="date" value={formData.date} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">Admission no/Staff Code<span className="text-danger">*</span></Form.Label>
                  <Form.Control name="staffCode" value={formData.staffCode} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">Issued To<span className="text-danger">*</span></Form.Label>
                  <Form.Control name="issuedTo" value={formData.issuedTo} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">Class/Department<span className="text-danger">*</span></Form.Label>
                  <Form.Control name="classOrDept" value={formData.classOrDept} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">RC Book Owner Name<span className="text-danger">*</span></Form.Label>
                  <Form.Control name="rcOwner" value={formData.rcOwner} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">RC Book No.</Form.Label>
                  <Form.Control name="rcNo" value={formData.rcNo} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">Vehicle Reg. No<span className="text-danger">*</span></Form.Label>
                  <Form.Control name="vehicleReg" value={formData.vehicleReg} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">Vehicle Type<span className="text-danger">*</span></Form.Label>
                  <Form.Control name="vehicleType" value={formData.vehicleType} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">Driving Licence No.</Form.Label>
                  <Form.Control name="licenseNo" value={formData.licenseNo} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">Authorization<span className="text-danger">*</span></Form.Label>
                  <Form.Control name="authorization" value={formData.authorization} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-bold">Remarks</Form.Label>
                  <Form.Control as="textarea" rows={2} name="remarks" value={formData.remarks} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Button type="submit" variant="success">Save</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default NewVehiclePassForm;
