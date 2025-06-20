import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Card, Table, Row, Col, Container, Modal } from 'react-bootstrap';
import QRCode from 'react-qr-code';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';
import axios from 'axios';

function VehicleGetdata() {
    const [data, setData] = useState([]);
    const [query, setQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5000/api/vehicles')
            .then(res => setData(res.data))
            .catch(err => console.error('Error fetching vehicle pass data:', err));
    }, []);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return data;
        return data.filter(item =>
            item.name?.toLowerCase().includes(q) ||
            item.vehicleNumber?.toLowerCase().includes(q) ||
            item.department?.toLowerCase().includes(q)
        );
    }, [data, query]);

    const clearFilters = () => {
        setQuery('');
    };

    const handlePrint = () => window.print();

    const handleDownload = async (id) => {
        const qrElement = document.getElementById(`qr-code-${id}`);
        if (!qrElement) return alert('QR code not found!');
        try {
            const dataUrl = await htmlToImage.toPng(qrElement);
            download(dataUrl, `${id}-vehiclepass.png`);
        } catch (err) {
            console.error('Failed to download QR code', err);
        }
    };

    const openModal = (item) => {
        setModalData(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalData(null);
    };

    return (
        <Container>
            <h3 className="text-center mt-4 p-5 mb-4">Vehicle Pass QR Management</h3>
            <Form>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label>Search (Name, Vehicle No., Dept)</Form.Label>
                        <Form.Control
                            type="search"
                            placeholder="Search here..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col md={6}>
                        <Button variant="secondary" onClick={clearFilters} className="me-2">
                            Clear Search
                        </Button>
                        <Button variant="primary" onClick={handlePrint} disabled={results.length === 0}>
                            Print QRs
                        </Button>
                    </Col>
                    <Col md={6} className="text-end">
                        Showing <strong>{results.length}</strong> item{results.length !== 1 ? 's' : ''}
                    </Col>
                </Row>
            </Form>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Issued Date</th>
                        <th>Class/Department</th>
                        <th>Vehicle Reg. No & Type</th>
                        <th>Pass No</th>
                        <th>Issued To</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map(item => (
                        <tr key={item._id}>
                            <td>{new Date(item.date).toLocaleDateString()}</td>
                            <td>{item.classOrDept}</td>
                            <td>{item.vehicleReg}, {item.vehicleType}</td>
                            <td>{item.passNo}</td>
                            <td>{item.issuedTo}</td>
                        </tr>
                    ))}
                    {results.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center">No data found</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            <div className="qr-print-grid">
                <Row xs={1} sm={2} md={3} lg={4} className="g-3">
                    {results.map(item => (
                        <Col key={item._id}>
                            <Card
                                className="p-3 text-center shadow-sm"
                                onClick={() => openModal(item)}
                            >
                                <div id={`qr-code-${item._id}`} className="qr-box">
                                    <QRCode value={JSON.stringify(item)} size={130} />
                                    <div className="qr-label">Vehicle Reg. No & Type {item.vehicleReg}, {item.vehicleType}</div>
                                </div>
                                <Card.Body>
                                    <Card.Title>{item.name}</Card.Title>
                                    <Card.Text style={{ fontSize: '0.85rem' }}>
                                        Dept: {item.classOrDept}<br />
                                        Pass No: {item.passNo}<br />
                                        Date: {new Date(item.date).toLocaleDateString()}
                                    </Card.Text>
                                </Card.Body>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(item._id);
                                    }}
                                >
                                    Download QR
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            <Modal show={showModal} onHide={closeModal} centered size="md">
                <Modal.Header closeButton>
                    <Modal.Title>Vehicle Pass Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalData && (
                        <Table bordered size="sm" responsive>
                            <tbody>
                                {Object.entries(modalData).map(([key, value]) => (
                                    <tr key={key}>
                                        <th style={{ textTransform: 'capitalize' }}>{key}</th>
                                        <td>{String(value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .qr-print-grid {
                    margin-top: 1rem;
                }

                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    .qr-print-grid,
                    .qr-print-grid * {
                        visibility: visible !important;
                    }
                    .qr-print-grid {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: flex-start;
                        gap: 1rem;
                    }
                    .qr-print-grid .card {
                        page-break-inside: avoid;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    .qr-print-grid .card-body,
                    .qr-print-grid .btn,
                    .qr-print-grid .card-text {
                        display: none !important;
                    }
                    .qr-print-grid .card-title {
                        font-size: 14px;
                        margin-top: 0.5rem;
                    }
                }
            `}</style>
        </Container>
    );
}

export default VehicleGetdata;
