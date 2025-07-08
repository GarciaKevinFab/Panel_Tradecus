import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es'; // Importa el idioma español
import { BASE_URL } from '../../utils/config';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './manageBookings.css';
import { useNavigate } from 'react-router-dom';
import CustomModal from '../Modal/CustomModal';

const localizer = momentLocalizer(moment);

const ManageBookings = () => {

  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/booking`, { withCredentials: true });
      const events = res.data.data.map(booking => ({
        ...booking,
        start: new Date(booking.bookAt),
        end: new Date(booking.bookAt),
        title: `${booking.tourName} - ${booking.guestSize} guests`
      }));
      setBookings(events);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectEvent = (booking) => {
    setSelectedBooking(booking);
    setModalIsOpen(true);
  };

  const handleBookingDeleted = (deletedBookingId) => {
    // Actualiza el estado eliminando la reserva
    setBookings(bookings.filter((booking) => booking._id !== deletedBookingId));
  };

  const handleSelectSlot = (slotInfo) => {
    navigate(`/create_booking?date=${slotInfo.start.toISOString()}`);
  }

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: '#3174ad',
      borderRadius: '5px',
      border: '1px solid #25587a',
      color: 'white',
    }
  });
  const messages = {
    today: 'Hoy',
    previous: 'Anterior',
    next: 'Siguiente',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    showMore: total => `+ Ver más (${total})`
  };

  return (
    <div className="ManageBookings">
      <h2>📅 Gestión de Reservas</h2>
      <p>Haz clic sobre una fecha para crear una reserva, o sobre un evento para ver detalles.</p>

      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={bookings}
          startAccessor="start"
          endAccessor="end"
          selectable='ignoreEvents'
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          messages={messages}
        />
      </div>

      <CustomModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        booking={selectedBooking}
        onBookingDeleted={handleBookingDeleted}
      />
    </div>

  );
};

export default ManageBookings;
