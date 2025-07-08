import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../utils/config';
import { toast } from 'react-toastify';
import './customModal.css';
import { MdClose, MdEvent, MdDelete } from 'react-icons/md';

Modal.setAppElement('#root');

const CustomModal = ({ isOpen, onRequestClose, booking, onBookingDeleted }) => {
  const [bookingInfo, setBookingInfo] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (booking) {
      setBookingInfo(booking);
    }
  }, [booking]);

  const handleReschedule = () => {
    navigate(`/reschedule_booking`, { state: { booking: bookingInfo } });
    onRequestClose(); // Close the modal after the action
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/booking/${bookingInfo._id}`, {
        withCredentials: true
      });
      toast.success('Reserva eliminada con éxito.');
      onRequestClose();
      onBookingDeleted(bookingInfo._id);
    } catch (error) {
      console.error('Error al eliminar la reserva:', error);
      toast.error('Error al eliminar la reserva.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Detalle de la Reserva"
      overlayClassName="ReactModal__Overlay"
      className="ReactModal__Content"
    >
      <div className="CustomModal-header">
        <h2 className="CustomModal-title">Detalle de la Reserva</h2>
        <button className="CustomModal-close" onClick={onRequestClose}>
          <MdClose />
        </button>
      </div>
      <div className="CustomModal-content">
        <p>Email del Usuario: {bookingInfo.userEmail}</p>
        <p>Nombre del Tour: {bookingInfo.tourName}</p>
        <p>Tipo de Tour: {bookingInfo.tourType}</p>
        <p>Número de Invitados: {bookingInfo.guestSize}</p>
        <p>Teléfono: {bookingInfo.phone}</p>
        <p>Fecha de Reserva: {bookingInfo.bookAt && moment(bookingInfo.bookAt).format('LLL')}</p>
        <h3>Detalles de los Invitados:</h3>
        {bookingInfo.userData && bookingInfo.userData.map((user, index) => (
          <div key={index}>
            <p>Nombre: {user.nombres}</p>
            <p>Apellido Paterno: {user.apellidoPaterno}</p>
            <p>Apellido Materno: {user.apellidoMaterno}</p>
          </div>
        ))}
      </div>
      <div className="CustomModal-buttons">
        <button className="CustomModal-button CustomModal-button--reschedule" onClick={handleReschedule}>
          <MdEvent /> Reprogramar
        </button>
        <button className="CustomModal-button CustomModal-button--delete" onClick={handleDelete}>
          <MdDelete /> Eliminar
        </button>
      </div>
    </Modal>
  );
};

export default CustomModal;
