import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../utils/config';
import { toast } from 'react-toastify';
import './customModal.css';
import { MdClose, MdEvent, MdDelete, MdDownload } from 'react-icons/md';
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle';

Modal.setAppElement('#root');

const CustomModal = ({ isOpen, onRequestClose, booking, onBookingDeleted }) => {
  const [bookingInfo, setBookingInfo] = useState({});
  const navigate = useNavigate();
  const pdfRef = useRef();

  // Trae siempre la reserva completa si falta price o es solo el _id
  useEffect(() => {
    if (!booking) return;
    if (booking.price && booking.userData) {
      setBookingInfo(booking);
    } else if (booking._id) {
      axios.get(`${BASE_URL}/booking/${booking._id}`)
        .then(res => setBookingInfo(res.data.data))
        .catch(() => setBookingInfo(booking));
    }
  }, [booking]);

  const handleReschedule = () => {
    navigate(`/reschedule_booking`, { state: { booking: bookingInfo } });
    onRequestClose();
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

  const handleDownloadPDF = () => {
    const element = pdfRef.current;
    const opt = {
      margin: 0.5,
      filename: `NotaPedido_${bookingInfo._id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
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

      <div className="CustomModal-content" ref={pdfRef}>
        <div className="proforma-header">
          <h3>🧾 NOTA DE PEDIDO</h3>
          <p><strong>Fecha:</strong> {moment(bookingInfo.bookAt).format('LL')}</p>
        </div>

        <div className="proforma-section">
          <h4>📍 Detalles del Tour</h4>
          <p><strong>Nombre del Tour:</strong> {bookingInfo.tourName}</p>
          <p><strong>Tipo de Tour:</strong> {bookingInfo.tourType}</p>
          <p><strong>Número de Invitados:</strong> {bookingInfo.guestSize}</p>
          <p><strong>Fecha de Reserva:</strong> {moment(bookingInfo.bookAt).format('LLL')}</p>
        </div>

        <div className="proforma-section">
          <h4>👤 Información del Usuario</h4>
          <p><strong>Email:</strong> {bookingInfo.userEmail}</p>
          <p><strong>Teléfono:</strong> {bookingInfo.phone}</p>
        </div>

        {bookingInfo.userData && Array.isArray(bookingInfo.userData) && (
          <div className="proforma-section">
            <h4>👥 Datos de los Invitados</h4>
            {bookingInfo.userData.map((user, index) => (
              <div key={index} className="guest-entry">
                <p><strong>Nombre:</strong> {user.nombres}</p>
                <p><strong>Ap. Paterno:</strong> {user.apellidoPaterno}</p>
                <p><strong>Ap. Materno:</strong> {user.apellidoMaterno}</p>
              </div>
            ))}
          </div>
        )}

        <div className="proforma-section">
          <h4>💸 Total a Pagar</h4>
          <p style={{ fontWeight: "bold", fontSize: 18 }}>
            S/. {bookingInfo.price !== undefined ? bookingInfo.price : "--"}
          </p>
        </div>
      </div>

      <div className="CustomModal-buttons">
        <button className="CustomModal-button" onClick={handleDownloadPDF}>
          <MdDownload /> Descargar Nota
        </button>
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
