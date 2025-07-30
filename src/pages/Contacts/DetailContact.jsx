import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "reactstrap";
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../utils/config';
import { toast } from 'react-toastify';
import { FaArrowLeft } from "react-icons/fa";
import '../../styles/contact/contactDetail.css';

const ContactDetail = () => {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/contact/${id}`);
        if (!response.data || !response.data.name) {
          setContact(null);
          toast.error("No se encontró el contacto.");
        } else {
          setContact(response.data);
        }
      } catch (error) {
        toast.error("Error al obtener el contacto");
        setContact(null);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, [id]);

  const handleBack = () => {
    navigate('/manage_contacts');
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!contact) {
    return (
      <div className="not-found">
        <h3>No se encontró el contacto</h3>
        <Button onClick={handleBack} className="back-button">
          <FaArrowLeft /> Regresar
        </Button>
      </div>
    );
  }

  return (
    <div className="contact-detail-container">
      <h2>Detalle del Contacto</h2>
      <p><strong>Nombre:</strong> {contact.name}</p>
      <p><strong>Email:</strong> {contact.email}</p>
      <p><strong>Mensaje:</strong> {contact.message}</p>
      <Button onClick={handleBack} className="back-button">
        <FaArrowLeft /> Regresar
      </Button>
    </div>
  );
};

export default ContactDetail;
