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
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const localizer = momentLocalizer(moment);

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${BASE_URL}/booking`, {
        headers: { Authorization: `Bearer ${token}` }
      }); const events = res.data.data.map(booking => ({
        ...booking,
        start: moment.utc(booking.bookAt).local().toDate(),
        end: moment.utc(booking.bookAt).local().toDate(),
        title: `${booking.tourName} - ${booking.guestSize} guests`
      }));
      setBookings(events);
    } catch (err) {
      toast.error("No se pudieron cargar las reservas. Intenta recargar la página.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (booking) => {
    setSelectedBooking(booking);
    setModalIsOpen(true);
  };

  const handleBookingDeleted = (deletedBookingId) => {
    setBookings(bookings.filter((booking) => booking._id !== deletedBookingId));
    toast.success("Reserva eliminada correctamente.");
    setModalIsOpen(false);
  };

  const handleSelectSlot = (slotInfo) => {
    navigate(`/create_booking?date=${slotInfo.start.toISOString()}`);
  };

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
        {loading ? (
          <div className="calendar-loading">
            <span>Cargando reservas...</span>
          </div>
        ) : (
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
        )}
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
