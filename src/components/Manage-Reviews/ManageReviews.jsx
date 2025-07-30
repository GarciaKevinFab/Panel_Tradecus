import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/config';
import 'react-toastify/dist/ReactToastify.css';
import './manageReviews.css';
import { FaTrashAlt, FaStar } from 'react-icons/fa';

// Si tienes un ConfirmAlert personalizado, úsalo. Sino, quita el import y deja window.confirm
import ConfirmAlert from '../Alerts/ConfirmAlert';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/review`);
      setReviews(res.data.data);
    } catch (error) {
      toast.error("Error al obtener las reseñas.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (reviewId) => {
    ConfirmAlert({
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar esta reseña?",
      onConfirm: async () => {
        setDeletingId(reviewId);
        try {
          await axios.delete(`${BASE_URL}/review/${reviewId}`);
          setReviews(reviews => reviews.filter(review => review._id !== reviewId));
          toast.success('Reseña eliminada exitosamente!');
        } catch (error) {
          toast.error('Ocurrió un error al eliminar la reseña');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  return (
    <div className="ManageReviews">
      <h2>⭐ Gestión de Reseñas</h2>
      {loading ? (
        <p className="loading">Cargando reseñas...</p>
      ) : reviews.length === 0 ? (
        <p className="no-data">No hay reseñas disponibles</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>👤 Usuario</th>
                <th>📝 Comentario</th>
                <th>⭐ Calificación</th>
                <th>🗑️ Acción</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id}>
                  <td>{review.username}</td>
                  <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {review.reviewText}
                  </td>
                  <td>
                    <span className="rating">
                      {Array.from({ length: review.rating }, (_, i) => (
                        <FaStar key={i} className="star-icon" />
                      ))}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="delete-review"
                      title="Eliminar reseña"
                      disabled={deletingId === review._id}
                    >
                      <FaTrashAlt />
                    </button>
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

export default ManageReviews;
