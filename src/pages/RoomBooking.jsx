import React, { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from 'react-router-dom';


function RoomBooking() {
  const [roomType, setRoomType] = useState("");
  const [date, setDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [purpose, setPurpose] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [tablesWithCloth, setTablesWithCloth] = useState(0);
  const [tablesWithoutCloth, setTablesWithoutCloth] = useState(0);
  const [executiveChairs, setExecutiveChairs] = useState(0);
  const [participantChairs, setParticipantChairs] = useState(0);
  const [additionalChairs, setAdditionalChairs] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");

  const facilitiesOptions = [
    "Projector",
    "Audio System",
    "Nila Vilakku (Lamp)",
    "Teapoy for stage",
    "Other(Enter remarks)",
  ];
  const formatTime = (dateObj) => {
    if (!dateObj) return "";
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };
  const handleFacilityChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFacilities([...facilities, value]);
    } else {
      setFacilities(facilities.filter((f) => f !== value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomType || !date || !timeFrom || !timeTo || !purpose || !agreed) {
      alert("Please fill all required fields and agree to the terms.");
      return;
    }

    const username = localStorage.getItem("name") || "Unknown User";
    const department = localStorage.getItem("department") || "Unknown Department";

    const data = {
      username,
      department,
      mobileNumber,
      roomType,
      date,
      timeFrom: formatTime(timeFrom),
      timeTo: formatTime(timeTo),
      purpose,
      facilities,
      tablesWithCloth,
      tablesWithoutCloth,
      executiveChairs,
      participantChairs,
      additionalChairs,
      remarks,
      agreed,
    };

    try {
      const res = await fetch("https://proccms-backend.onrender.com/api/room-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Room booked successfully!", { position: "top-center" });
        // Reset form
        setRoomType("");
        setDate("");
        setTimeFrom("");
        setTimeTo("");
        setPurpose("");
        setFacilities([]);
        setTablesWithCloth(0);
        setTablesWithoutCloth(0);
        setExecutiveChairs(0);
        setParticipantChairs(0);
        setAdditionalChairs(0);
        setRemarks("");
        setMobileNumber("");
        setAgreed(false);
      } else if (res.status === 409) {
        toast.error("Room already booked for selected time range.", { position: "top-center" });
      } else {
        toast.error("Booking failed. Please try again.", { position: "top-center" });
      }
    } catch (error) {
      toast.error("Error: " + error.message, { position: "top-center" });
    }
  };

  return (
    <div className="container my-4 p-5">
      <Row>
        <Col xs={12} md={8}>
          <Form onSubmit={handleSubmit} className="bg-white p-4 p-md-5 border rounded shadow-sm">
            <h4 className="mb-4 text-center text-md-start fw-bold">Room Booking Form</h4>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Room Type<span className="text-danger">*</span></Form.Label>
              <Form.Select
                size="sm"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                required
              >
                <option value="">---Select---</option>
                <option>Auditorium</option>
                <option>Decennial</option>
                <option>Insight</option>
                <option>415/416</option>
                <option>Guest Room</option>
                <option>Main Dinning Hall</option>
                <option>Dinning Hall Near Decennial</option>
                <option>OTHER (Enter Remarks)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Date<span className="text-danger">*</span></Form.Label>
              <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Time From<span className="text-danger">*</span></Form.Label>
                  <DatePicker
                    selected={timeFrom}
                    onChange={(val) => setTimeFrom(val)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="form-control"
                    placeholderText="Select time"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Time To<span className="text-danger">*</span></Form.Label>
                  <DatePicker
                    selected={timeTo}
                    onChange={(val) => setTimeTo(val)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="form-control"
                    placeholderText="Select time"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Purpose<span className="text-danger">*</span></Form.Label>
              <Form.Control as="textarea" rows={3} value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Facilities (Optional)</Form.Label>
              <Row>
                {facilitiesOptions.map((fac, idx) => (
                  <Col xs={12} sm={6} key={idx} className="mb-2">
                    <Form.Check
                      type="checkbox"
                      label={<span>{fac}</span>}
                      value={fac}
                      checked={facilities.includes(fac)}
                      onChange={handleFacilityChange}
                    />
                  </Col>
                ))}
              </Row>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Tables with Cloth</Form.Label>
                  <Form.Control type="number" min={0} value={tablesWithCloth} onChange={(e) => setTablesWithCloth(Number(e.target.value))} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Tables without Cloth</Form.Label>
                  <Form.Control type="number" min={0} value={tablesWithoutCloth} onChange={(e) => setTablesWithoutCloth(Number(e.target.value))} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Executive Chairs</Form.Label>
                  <Form.Control type="number" min={0} value={executiveChairs} onChange={(e) => setExecutiveChairs(Number(e.target.value))} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Participant Chairs</Form.Label>
                  <Form.Control type="number" min={0} value={participantChairs} onChange={(e) => setParticipantChairs(Number(e.target.value))} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Additional Chairs</Form.Label>
                  <Form.Control type="number" min={0} value={additionalChairs} onChange={(e) => setAdditionalChairs(Number(e.target.value))} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Remarks</Form.Label>
              <Form.Control as="textarea" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Mobile Number<span className="text-danger">*</span></Form.Label>
              <Form.Control type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label={<span className="fw-bold">I agree to the terms and conditions</span>}
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
              />
            </Form.Group>

            <Button type="submit" className="fw-bold w-100 mt-3">Book Room</Button>
          </Form>
        </Col>

        {/* Right Section */}
        <Col xs={12} md={4}>
          <div className="p-4 p-md-5 bg-white border rounded shadow-sm mt-4 mt-md-0 text-center text-md-start">
            <Link to="/booking-calender" className="text-primary d-block mb-3 fw-bold">
              View Booking Calendar
            </Link>
            <div className="mb-3">
              <strong>Background Colors</strong>
              <div className="mt-2">
                <div className="d-flex align-items-center mb-2">
                  <div style={{ width: '20px', height: '20px', backgroundColor: 'green', marginRight: '10px' }}></div>
                  <span>Booked</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#ffc107', marginRight: '10px' }}></div>
                  <span>Pending</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#dc3545', marginRight: '10px' }}></div>
                  <span>Cancelled</span>
                </div>
              </div>
            </div>
            <div>SOP - Repair Request</div>
          </div>
        </Col>
      </Row>

      <ToastContainer autoClose={1000} position="top-center" />
    </div>
  );
}

export default RoomBooking;


// import React, { useState } from "react";
// import { Form, Row, Col, Button } from "react-bootstrap";
// import { toast, ToastContainer } from 'react-toastify';

// function RoomBooking() {
//   const [roomType, setRoomType] = useState("");
//   const [date, setDate] = useState("");
//   const [timeFrom, setTimeFrom] = useState("");
//   const [timeTo, setTimeTo] = useState("");
//   const [purpose, setPurpose] = useState("");
//   const [facilities, setFacilities] = useState([]);
//   const [tablesWithCloth, setTablesWithCloth] = useState(0);
//   const [tablesWithoutCloth, setTablesWithoutCloth] = useState(0);
//   const [executiveChairs, setExecutiveChairs] = useState(0);
//   const [participantChairs, setParticipantChairs] = useState(0);
//   const [additionalChairs, setAdditionalChairs] = useState(0);
//   const [remarks, setRemarks] = useState("");
//   const [agreed, setAgreed] = useState(false);
//   const [mobileNumber, setMobileNumber] = useState("");

//   const facilitiesOptions = [
//     "Projector",
//     "Whiteboard",
//     "Microphone",
//     "WiFi",
//     "Air Conditioning",
//   ];

//   const handleFacilityChange = (e) => {
//     const { value, checked } = e.target;
//     if (checked) {
//       setFacilities([...facilities, value]);
//     } else {
//       setFacilities(facilities.filter((f) => f !== value));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!roomType || !date || !timeFrom || !timeTo || !purpose || !agreed) {
//       alert("Please fill all required fields and agree to the terms.");
//       return;
//     }

//     const username = localStorage.getItem("username") || "Unknown User";
//     const department = localStorage.getItem("department") || "Unknown Department";

//     const data = {
//       username,
//       department,
//       mobileNumber,
//       roomType,
//       date,
//       timeFrom,
//       timeTo,
//       purpose,
//       facilities,
//       tablesWithCloth,
//       tablesWithoutCloth,
//       executiveChairs,
//       participantChairs,
//       additionalChairs,
//       remarks,
//       agreed,
//     };

//     try {
//       const res = await fetch("http://localhost:5000/api/room-booking", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });

//       if (res.ok) {
//         toast.success("Room booked successfully!", { position: "top-center" });
//         setRoomType("");
//         setDate("");
//         setTimeFrom("");
//         setTimeTo("");
//         setPurpose("");
//         setFacilities([]);
//         setTablesWithCloth(0);
//         setTablesWithoutCloth(0);
//         setExecutiveChairs(0);
//         setParticipantChairs(0);
//         setAdditionalChairs(0);
//         setRemarks("");
//         setMobileNumber("");
//         setAgreed(false);
//       } else {
//         toast.error("Booking failed.", { position: "top-center" });
//       }
//     } catch (error) {
//       toast.error("Error: " + error.message, { position: "top-center" });
//     }
//   };

//   return (
//     <div className="container my-4 p-5">
//       <Row>
//         {/* Responsive Booking Form */}
//         <Col xs={12} md={8}>
//           <Form onSubmit={handleSubmit} className="bg-white p-4 p-md-5 border rounded shadow-sm">
//             <h4 className="mb-4 fw-bold text-center text-md-start">Room Booking Form</h4>

//             <Form.Group className="mb-3">
//               <Form.Label>Room Type<span className="text-danger">*</span></Form.Label>
//               <Form.Select
//                 size="sm"
//                 className="fw-bold"
//                 value={roomType}
//                 onChange={(e) => setRoomType(e.target.value)}
//                 required
//               >
//                 <option value="">---Select---</option>
//                 <option>Auditorium</option>
//                 <option>Decennial</option>
//                 <option>Insight</option>
//                 <option>415/416</option>
//                 <option>Guest Room</option>
//                 <option>Main Dinning Hall</option>
//                 <option>Dinning Hall Near Decennial</option>
//                 <option>OTHER (Enter Remarks)</option>
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Date<span className="text-danger">*</span></Form.Label>
//               <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
//             </Form.Group>

//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Time From<span className="text-danger">*</span></Form.Label>
//                   <Form.Control type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} required />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Time To<span className="text-danger">*</span></Form.Label>
//                   <Form.Control type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} required />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Form.Group className="mb-3">
//               <Form.Label>Purpose<span className="text-danger">*</span></Form.Label>
//               <Form.Control as="textarea" rows={3} value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Facilities (Optional)</Form.Label>
//               <div className="d-flex flex-wrap">
//                 {facilitiesOptions.map((fac, idx) => (
//                   <Form.Check
//                     key={idx}
//                     type="checkbox"
//                     label={fac}
//                     value={fac}
//                     checked={facilities.includes(fac)}
//                     onChange={handleFacilityChange}
//                     className="me-3"
//                   />
//                 ))}
//               </div>
//             </Form.Group>

//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Tables with Cloth</Form.Label>
//                   <Form.Control type="number" min={0} value={tablesWithCloth} onChange={(e) => setTablesWithCloth(Number(e.target.value))} />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Tables without Cloth</Form.Label>
//                   <Form.Control type="number" min={0} value={tablesWithoutCloth} onChange={(e) => setTablesWithoutCloth(Number(e.target.value))} />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row>
//               <Col md={4}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Executive Chairs</Form.Label>
//                   <Form.Control type="number" min={0} value={executiveChairs} onChange={(e) => setExecutiveChairs(Number(e.target.value))} />
//                 </Form.Group>
//               </Col>
//               <Col md={4}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Participant Chairs</Form.Label>
//                   <Form.Control type="number" min={0} value={participantChairs} onChange={(e) => setParticipantChairs(Number(e.target.value))} />
//                 </Form.Group>
//               </Col>
//               <Col md={4}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Additional Chairs</Form.Label>
//                   <Form.Control type="number" min={0} value={additionalChairs} onChange={(e) => setAdditionalChairs(Number(e.target.value))} />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Form.Group className="mb-3">
//               <Form.Label>Remarks</Form.Label>
//               <Form.Control as="textarea" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Mobile Number<span className="text-danger">*</span></Form.Label>
//               <Form.Control
//                 type="tel"
//                 placeholder="Enter mobile number"
//                 value={mobileNumber}
//                 onChange={(e) => setMobileNumber(e.target.value)}
//                 required
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Check
//                 type="checkbox"
//                 label="I agree to the terms and conditions"
//                 checked={agreed}
//                 onChange={(e) => setAgreed(e.target.checked)}
//                 required
//               />
//             </Form.Group>

//             <Button type="submit" className="fw-bold w-100 w-md-auto mt-3">Book Room</Button>
//           </Form>
//         </Col>

//         {/* Responsive Info Box */}
//         <Col xs={12} md={4}>
//           <div className="p-4 p-md-5 bg-white border rounded shadow-sm small fw-bold mt-4 mt-md-0 text-center text-md-start">
//             <a href="booking-calender" className="fw-semibold text-primary d-block mb-3">
//               View Booking Calendar
//             </a>
//             <div className="mb-3">
//               <strong>Background Colors</strong>
//               <div className="mt-2">
//                 <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
//                   <div style={{ width: '20px', height: '20px', backgroundColor: 'green', marginRight: '10px' }}></div>
//                   <span>Booked</span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
//                   <div style={{ width: '20px', height: '20px', backgroundColor: '#ffc107', marginRight: '10px' }}></div>
//                   <span>Pending</span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
//                   <div style={{ width: '20px', height: '20px', backgroundColor: '#dc3545', marginRight: '10px' }}></div>
//                   <span>Cancelled</span>
//                 </div>
//               </div>
//             </div>
//             <div>SOP - Repair Request</div>
//           </div>
//         </Col>
//       </Row>

//       <ToastContainer autoClose={1000} position="top-center" />
//     </div>
//   );
// }

// export default RoomBooking;
