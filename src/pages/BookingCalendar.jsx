import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import {
  Modal,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import './BookingCalendar.css';

const username = localStorage.getItem("name");
const role = localStorage.getItem("role");

const CalendarBooking = ({ onBookingUpdated }) => {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [assignedStaff, setAssignedStaff] = useState('');
  const [updating, setUpdating] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const calendarRef = useRef(null);
  const location = useLocation(); // for getting ?date param from URL

  const fetchBookings = async () => {
    try {
      const response = await axios.get('https://proccms-backend.onrender.com/api/room-booking');
      const bookingsData = response.data;
      setBookings(bookingsData);

      const parseDateTime = (date, time) => {
        if (!date || !time) return new Date(date || Date.now());
        const [timeStr, modifier] = time.split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
      };

      const mappedEvents = bookingsData.map((booking, index) => {
        const startDate = booking.bookingDateTime
          ? new Date(booking.bookingDateTime)
          : parseDateTime(booking.date, booking.timeFrom);

        let bgColor = '#6c757d';
        if (booking.status === 'Booked') bgColor = '#59a10be5';
        else if (booking.status === 'Cancelled') bgColor = '#dc3545';

        const startTimeStr = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const bookingNum = index + 1;

        return {
          id: booking._id,
          title: `${startTimeStr} Booking No:${bookingNum}`,
          start: startDate,
          allDay: false,
          backgroundColor: bgColor,
          borderColor: bgColor,
          textColor: 'black',
          extendedProps: booking,
        };
      });

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    }
  };

  const fetchStaffList = async () => {
    try {
      const res = await axios.get('https://proccms-backend.onrender.com/api/staff');
      setStaffList(res.data);
    } catch (error) {
      console.error('Failed to fetch staff list', error);
      setStaffList([]);
    }
  };

  const handleEventClick = (info) => {
    const booking = info.event.extendedProps;
    setSelectedBooking(booking);
    setAssignedStaff(booking.assignedStaff || '');
    setOpenModal(true);
  };

  const handleMouseEnter = (eventInfo, e) => {
    setHoveredEvent(eventInfo.event.extendedProps);
    setTooltipPosition({ x: e.pageX, y: e.pageY });
  };

  const handleMouseLeave = () => setHoveredEvent(null);

  const handleMouseMove = (e) => {
    if (hoveredEvent) {
      setTooltipPosition({ x: e.pageX + 10, y: e.pageY + 10 });
    }
  };

  useEffect(() => {
    fetchBookings();
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (openModal) fetchStaffList();
  }, [openModal]);

  // 👇 Navigate to the date in URL after render
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const dateParam = queryParams.get('date');
    if (dateParam && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(dateParam);
    }
  }, [location.search]);

  const handleClose = () => {
    setOpenModal(false);
    setSelectedBooking(null);
    setAssignedStaff('');
  };

  const handleUpdateBooking = async (newStatus) => {
    if (!selectedBooking) return;
    setUpdating(true);
    try {
      const response = await axios.put(
        `https://proccms-backend.onrender.com/api/room-booking/${selectedBooking._id}`,
        {
          status: newStatus,
          assignedStaff,
        }
      );
      setSelectedBooking(response.data);
      await fetchBookings();
      setUpdating(false);
      setOpenModal(false);
      if (onBookingUpdated) onBookingUpdated();
    } catch (error) {
      console.error('Failed to update booking', error);
      setUpdating(false);
      alert('Failed to update booking. Please try again.');
    }
  };

  return (
    <div className="calendar-container mt-5">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        height="auto"
        eventClick={handleEventClick}
        eventDisplay="block"
        eventContent={(eventInfo) => (
          <div
            onMouseEnter={(e) => handleMouseEnter(eventInfo, e)}
            onMouseLeave={handleMouseLeave}
            style={{
              backgroundColor: eventInfo.event.backgroundColor,
              padding: '1px 3px',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '10px',
              color: 'white',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {eventInfo.timeText} {eventInfo.event.title}
          </div>
        )}
      />

      {/* Floating Tooltip */}
      {hoveredEvent && (
        <div
          className="tooltip-box"
          style={{
            top: tooltipPosition.y,
            left: tooltipPosition.x,
            position: 'absolute'
          }}
        >
          <strong>{hoveredEvent.bookingNumber ? `#Booking No: ${hoveredEvent.bookingNumber}` : 'Booking'}</strong> - {hoveredEvent.roomType || 'Room'}
          <br />
          <b>Booked Time:</b>{' '}
          {hoveredEvent.bookingDateTime
            ? `${new Date(hoveredEvent.bookingDateTime).toLocaleDateString('en-IN')} – ${new Date(hoveredEvent.bookingDateTime).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}`
            : hoveredEvent.date
              ? `${hoveredEvent.date} – ${hoveredEvent.timeFrom || ''} to ${hoveredEvent.timeTo || ''}`
              : 'N/A'}
          <br />
          <b>Person:</b> {hoveredEvent.username || 'N/A'} <br />
          <b>Purpose:</b> {hoveredEvent.purpose || 'N/A'}
        </div>
      )}

      {/* Admin-only Booking Details Modal */}
      {role === 'admin' && (
        <Modal open={openModal} onClose={handleClose}>
          <div
            className="modal-box"
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '24px',
              width: '90%',
              maxWidth: '700px',
              margin: '5vh auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              maxHeight: '90vh',
              overflow: 'hidden'
            }}
          >
            {selectedBooking && (
              <>
                <h3 style={{ fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                  View Room Booking Details
                </h3>
                <div
                  style={{
                    maxHeight: '65vh',
                    overflowY: 'auto',
                    paddingRight: '8px',
                    marginTop: '10px',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      Booking No: #{selectedBooking.bookingNumber || selectedBooking._id.slice(-4)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span
                      style={{
                        backgroundColor: selectedBooking.status === 'Booked' ? '#28a745' : '#dc3545',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      Booking Status: {selectedBooking.status}
                    </span>
                    <span
                      style={{
                        backgroundColor: '#ffc107',
                        color: '#000',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      {selectedBooking.requestFrom?.username || selectedBooking.username}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <p><strong>Name:</strong> {selectedBooking.requestFrom?.username || selectedBooking.username}</p>
                    <p><strong>Department:</strong> {selectedBooking.requestFrom?.department || selectedBooking.department}</p>
                    <p><strong>Email:</strong> {selectedBooking.requestFrom?.email || selectedBooking.email || 'N/A'}</p>
                    <p><strong>Mobile:</strong> {selectedBooking.requestFrom?.mobile || selectedBooking.mobileNumber}</p>
                    <p><strong>Requested Date:</strong> {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                    <p><strong>Requested Room:</strong> {selectedBooking.room || selectedBooking.roomType}</p>
                    <p><strong>Booking Date & Time:</strong> {
                      selectedBooking.bookingDateTime
                        ? new Date(selectedBooking.bookingDateTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : `${selectedBooking.date} – ${selectedBooking.timeFrom} to ${selectedBooking.timeTo}`
                    }</p>
                    <p><strong>Purpose:</strong> {selectedBooking.purpose}</p>
                    <p style={{ gridColumn: '1 / -1' }}><strong>Facilities:</strong> {Array.isArray(selectedBooking.facilities) ? selectedBooking.facilities.join(', ') : selectedBooking.facilities || 'N/A'}</p>
                    <p style={{ gridColumn: '1 / -1' }}><strong>Remarks / Special Arrangements:</strong> {selectedBooking.specialArrangements || selectedBooking.remarks || 'None'}</p>
                    <p><strong>No of Tables with table cloth:</strong> {selectedBooking.tablesWithCloth || 0}</p>
                    <p><strong>No of Tables without table cloth:</strong> {selectedBooking.tablesWithoutCloth || 0}</p>
                    <p><strong>No of Executive Chairs:</strong> {selectedBooking.executiveChairs || 0}</p>
                    <p><strong>No of Participant Chairs:</strong> {selectedBooking.participantChairs || 0}</p>
                  </div>

                  {/* Staff Assignment */}
                  <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel id="assign-staff-label">Assign Staff</InputLabel>
                    <Select
                      labelId="assign-staff-label"
                      value={assignedStaff}
                      onChange={(e) => setAssignedStaff(e.target.value)}
                      label="Assign Staff"
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {staffList.map((staff) => (
                        <MenuItem key={staff._id} value={staff.name || staff._id}>
                          {staff.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleUpdateBooking('Booked')}
                    disabled={updating || selectedBooking.status === 'Booked'}
                  >
                    Confirm Booking
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleUpdateBooking('Cancelled')}
                    disabled={updating || selectedBooking.status === 'Cancelled'}
                  >
                    Cancel Booking
                  </Button>
                  <Button variant="outlined" onClick={handleClose}>Close</Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CalendarBooking;






// import React, { useEffect, useState } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import axios from 'axios';
// import { Modal, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
// import './BookingCalendar.css';

// const CalendarBooking = ({ onBookingUpdated }) => {
//   const [bookings, setBookings] = useState([]);
//   const [events, setEvents] = useState([]);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [openModal, setOpenModal] = useState(false);
//   const [assignedStaff, setAssignedStaff] = useState('');
//   const [updating, setUpdating] = useState(false);
//   const [staffList, setStaffList] = useState([]);

//   // Fetch all bookings
//   const fetchBookings = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/room-booking');
//       const bookingsData = response.data;
//       setBookings(bookingsData);

//       // Map bookings to calendar events
//       const mappedEvents = bookingsData.map((booking) => {
//         const startDate = booking.bookingDateTime
//           ? new Date(booking.bookingDateTime)
//           : booking.date
//             ? new Date(booking.date)
//             : new Date();

//         // Determine event color based on status
//         let bgColor = '#6c757d'; // default grey
//         if (booking.status === 'Booked') bgColor = '#198754'; // green
//         else if (booking.status === 'Cancelled') bgColor = '#dc3545'; // red
//         else if (booking.status === 'Pending') bgColor = '#6c757d'; // grey

//         return {
//           id: booking._id,
//           title: `Booking #${booking.bookingNumber || booking._id.slice(-5)}`,
//           start: startDate,
//           allDay: false,
//           backgroundColor: bgColor,
//           borderColor: bgColor,
//           textColor: 'white',
//           extendedProps: booking,
//         };
//       });

//       setEvents(mappedEvents);
//     } catch (error) {
//       console.error('Failed to fetch bookings', error);
//     }
//   };

//   // Fetch staff list on modal open
//   const fetchStaffList = async () => {
//     try {
//       const res = await axios.get('http://localhost:5000/api/staff'); // Update URL to your staff API
//       setStaffList(res.data);
//     } catch (error) {
//       console.error('Failed to fetch staff list', error);
//       setStaffList([]);
//     }
//   };
//   const formatTime = (dateOrTime) => {
//     if (!dateOrTime) return '';
//     const date = new Date(dateOrTime);
//     const options = { hour: 'numeric', minute: '2-digit', hour12: true };
//     return date.toLocaleTimeString([], options);
//   };

//   useEffect(() => {
//     fetchBookings();
//   }, []);

//   // When modal opens, fetch staff list
//   useEffect(() => {
//     if (openModal) {
//       fetchStaffList();
//     }
//   }, [openModal]);

//   const handleEventClick = (info) => {
//     const booking = info.event.extendedProps;
//     setSelectedBooking(booking);
//     setAssignedStaff(booking.assignedStaff || '');
//     setOpenModal(true);
//   };

//   const handleClose = () => {
//     setOpenModal(false);
//     setSelectedBooking(null);
//     setAssignedStaff('');
//   };

//   const handleUpdateBooking = async (newStatus) => {
//     if (!selectedBooking) return;
//     setUpdating(true);
//     try {
//       const response = await axios.put(`http://localhost:5000/api/room-booking/${selectedBooking._id}`, {
//         status: newStatus,
//         assignedStaff,
//       });
//       setSelectedBooking(response.data);
//       await fetchBookings();
//       setUpdating(false);
//       setOpenModal(false);

//       if (onBookingUpdated) {
//         onBookingUpdated();
//       }
//     } catch (error) {
//       console.error('Failed to update booking', error);
//       setUpdating(false);
//       alert('Failed to update booking. Please try again.');
//     }
//   };

//   return (
//     <div className="calendar-container mt-5">
//       <FullCalendar
//         plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//         initialView="dayGridMonth"
//         headerToolbar={{
//           left: 'prev,next today',
//           center: 'title',
//           right: 'dayGridMonth,timeGridWeek,timeGridDay',
//         }}
//         events={events}
//         height="auto"
//         eventClick={handleEventClick}
//         eventDisplay="block"  // ✅ Add this line
//       />


//       <Modal open={openModal} onClose={handleClose} aria-labelledby="booking-details-title">
//         <div
//           className="modal-box"
//           style={{ padding: 20, backgroundColor: 'white', margin: '10vh auto', maxWidth: 600, borderRadius: 8 }}
//         >
//           {selectedBooking && (
//             <>
//               <h2 id="booking-details-title" style={{ marginBottom: 16 }}>
//                 Booking Details
//               </h2>

//               <p>
//                 <strong>Requested By:</strong> {selectedBooking.requestFrom?.username || selectedBooking.username}
//               </p>
//               <p>
//                 <strong>Department:</strong> {selectedBooking.requestFrom?.department || selectedBooking.department}
//               </p>
//               <p>
//                 <strong>Mobile:</strong> {selectedBooking.requestFrom?.mobile || selectedBooking.mobileNumber}
//               </p>
//               <p>
//                 <strong>Booking Date & Time:</strong>{' '}
//                 {selectedBooking.bookingDateTime || `${selectedBooking.date} ${selectedBooking.timeFrom} - ${selectedBooking.timeTo}`}
//               </p>
//               <p>
//                 <strong>Room:</strong> {selectedBooking.room || selectedBooking.roomType}
//               </p>
//               <p>
//                 <strong>Status:</strong> {selectedBooking.status || 'Pending'}
//               </p>
//               <p>
//                 <strong>Purpose:</strong> {selectedBooking.purpose}
//               </p>
//               <p>
//                 <strong>Facilities:</strong>{' '}
//                 {Array.isArray(selectedBooking.facilities) ? selectedBooking.facilities.join(', ') : selectedBooking.facilities}
//               </p>
//               <p>
//                 <strong>Remarks / Special Arrangements:</strong> {selectedBooking.specialArrangements || selectedBooking.remarks}
//               </p>

//               {/* Staff Dropdown */}
//               <FormControl fullWidth margin="normal" variant="outlined">
//                 <InputLabel id="assign-staff-label">Assign Staff</InputLabel>
//                 <Select
//                   labelId="assign-staff-label"
//                   value={assignedStaff}
//                   onChange={(e) => setAssignedStaff(e.target.value)}
//                   label="Assign Staff"
//                 >
//                   <MenuItem value="">
//                     <em>None</em>
//                   </MenuItem>
//                   {staffList.map((staff) => (
//                     <MenuItem key={staff._id} value={staff.name || staff._id}>
//                       {staff.name}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
//                 <Button
//                   variant="contained"
//                   color="success"
//                   onClick={() => handleUpdateBooking('Booked')}
//                   disabled={updating || selectedBooking.status === 'Booked'}
//                 >
//                   Confirm Booking
//                 </Button>

//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleUpdateBooking('Cancelled')}
//                   disabled={updating || selectedBooking.status === 'Cancelled'}
//                 >
//                   Cancel Booking
//                 </Button>

//                 <Button variant="outlined" onClick={handleClose}>
//                   Close
//                 </Button>
//               </div>
//             </>
//           )}
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default CalendarBooking;
