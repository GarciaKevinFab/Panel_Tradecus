import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/config';
import 'react-toastify/dist/ReactToastify.css';
import './manageReviews.css';
import { FaTrashAlt, FaStar } from 'react-icons/fa';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/review`);
        setReviews(res.data.data);
      } catch (error) {
        toast.error("Error al obtener las reseñas");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleDelete = async (reviewId) => {
    const confirmDelete = window.confirm('¿Estás seguro de eliminar esta reseña?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}/review/${reviewId}`);
      setReviews(reviews.filter(review => review._id !== reviewId));
      toast.success('Reseña eliminada exitosamente!');
    } catch (error) {
      toast.error('Ocurrió un error al eliminar la reseña');
    }
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
                  <td>{review.reviewText}</td>
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
