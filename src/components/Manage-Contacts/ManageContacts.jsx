import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/config';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmAlert from '../Alerts/ConfirmAlert';
import { Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';

import './manageContacts.css';

const ManageContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/contact`);
      setContacts(res.data);
    } catch (error) {
      toast.error("Error al obtener los contactos.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (contactId) => {
    ConfirmAlert({
      title: 'Confirmación',
      message: '¿Estás seguro que fue atendido?',
      onConfirm: async () => {
        setProcessingId(contactId);
        try {
          await axios.delete(`${BASE_URL}/contact/${contactId}`);
          toast.success("Contacto atendido y eliminado correctamente.");
          setContacts(contacts => contacts.filter(c => c._id !== contactId)); // Actualiza local, UX más rápida
        } catch (error) {
          toast.error("Error al eliminar el contacto.");
        } finally {
          setProcessingId(null);
        }
      }
    });
  };

  return (
    <div className="ManageContacts">
      <h2>📨 Gestión de Contactos</h2>
      {loading ? (
        <p className="loading">Cargando...</p>
      ) : contacts.length === 0 ? (
        <p className="no-contacts">No hay contactos disponibles.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>👤 Nombre</th>
                <th>📧 Email</th>
                <th>📝 Mensaje</th>
                <th>✔️ Atendido</th>
                <th>🔍 Ver</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact._id}>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {contact.message}
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      onChange={() => handleCheck(contact._id)}
                      title="Marcar como atendido"
                      disabled={processingId === contact._id}
                    />
                  </td>
                  <td>
                    <Link
                      to={`/detail_contact/${contact._id}`}
                      className="btn secondary__btn"
                      title="Ver detalle"
                    >
                      <FaEye />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageContacts;
