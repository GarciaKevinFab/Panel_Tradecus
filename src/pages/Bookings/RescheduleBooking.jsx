import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, FormGroup, Label, Input, Button } from "reactstrap";
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../utils/config';
import 'react-toastify/dist/ReactToastify.css';
import { FiCalendar, FiArrowLeft } from 'react-icons/fi';
import moment from 'moment';
import '../../styles/bookings/rescheduleBooking.css';

const RescheduleBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingDataFromLocation = location.state?.booking;

  // Estado para la fecha de la reserva
  const [bookingDate, setBookingDate] = useState(bookingDataFromLocation ? moment(bookingDataFromLocation.bookAt).format('YYYY-MM-DDTHH:mm') : moment().format('YYYY-MM-DDTHH:mm'));

  useEffect(() => {
    if (bookingDataFromLocation) {
      setBookingDate(moment(bookingDataFromLocation.bookAt).format('YYYY-MM-DDTHH:mm'));
    }
  }, [bookingDataFromLocation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedBooking = {
      ...bookingDataFromLocation,
      bookAt: moment(bookingDate).toISOString()
    };

    axios.put(`${BASE_URL}/booking/${bookingDataFromLocation._id}`, updatedBooking, {
      withCredentials: true
    })
      .then(response => {
        toast.success('Reserva reprogramada con éxito.');
        navigate('/manage_bookings');
      })
      .catch(error => {
        console.error(error);
        toast.error('Error al reprogramar la reserva.');
      });
  };

  const handleBack = () => {
    navigate('/manage_bookings');
  };

  return (
    <div className="reschedule-container">
      <h2>Reprogramar reserva</h2>
      <Form onSubmit={handleSubmit} className="reschedule-form">
        <FormGroup className="reschedule-form-group">
          <Label for="bookAt">Nueva Fecha de Reserva:</Label>
          <Input
            type="datetime-local"
            name="bookAt"
            id="bookAt"
            value={bookingDate}
            onChange={e => setBookingDate(e.target.value)}
          />
        </FormGroup>
        <Button type="submit" className="reschedule-button"><FiCalendar /> Reprogramar Reserva</Button>
        <Button onClick={handleBack} className="back-button"><FiArrowLeft /> Regresar</Button>
      </Form>
    </div>
  );
};

export default RescheduleBooking;
