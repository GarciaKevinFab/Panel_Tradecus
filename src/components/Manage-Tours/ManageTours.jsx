import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../utils/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './manageTours.css';
import { FaEdit, FaTrashAlt, FaEye, FaPlus, FaGlobe } from 'react-icons/fa';
import ConfirmAlert from '../Alerts/ConfirmAlert';

const ITEMS_PER_PAGE = 5;

const ManageTours = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/tours`);
                const tourData = res.data.data;

                const formatted = tourData.map((tour) => ({
                    ...tour,
                    reviews: tour.reviews.length,
                    rating: tour.reviews.length > 0
                        ? (tour.reviews.reduce((acc, r) => acc + r.rating, 0) / tour.reviews.length).toFixed(1)
                        : 'N/A'
                }));

                setTours(formatted);
            } catch (err) {
                toast.error("Error al obtener los Tours");
            } finally {
                setLoading(false);
            }
        };

        fetchTours();
    }, []);

    const handleDeleteTour = (id) => {
        ConfirmAlert({
            title: "¿Eliminar tour?",
            message: "¿Estás seguro de que deseas eliminar este tour?",
            onConfirm: async () => {
                setDeletingId(id);
                try {
                    await axios.delete(`${BASE_URL}/tours/${id}`);
                    setTours(prev => prev.filter(tour => tour._id !== id));
                    toast.success("Tour eliminado exitosamente");
                } catch (error) {
                    toast.error("Error al eliminar el tour");
                } finally {
                    setDeletingId(null);
                }
            }
        });
    };

    const filteredTours = tours.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredTours.length / ITEMS_PER_PAGE);
    const paginatedTours = filteredTours.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="container">
            <h2><FaGlobe style={{ marginRight: "10px" }} /> Gestión de Tours</h2>

            <input
                type="text"
                placeholder="Buscar por título o ciudad..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                }}
            />

            {loading ? (
                <div className="loader">Cargando tours...</div>
            ) : (
                <>
                    {filteredTours.length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th>Ciudad</th>
                                        <th>Reviews</th>
                                        <th>Rating</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedTours.map((tour) => (
                                        <tr key={tour._id}>
                                            <td>{tour.title}</td>
                                            <td>{tour.city}</td>
                                            <td>{tour.reviews}</td>
                                            <td>{tour.rating}</td>
                                            <td className="actions">
                                                <Link to={`/edit_tour/${tour._id}`} className="btn edit"><FaEdit /> Editar</Link>
                                                <button
                                                    onClick={() => handleDeleteTour(tour._id)}
                                                    className="btn delete"
                                                    disabled={deletingId === tour._id}
                                                >
                                                    <FaTrashAlt /> Eliminar
                                                </button>
                                                <Link to={`/detail_tour/${tour._id}`} className="btn view"><FaEye /> Ver</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="pagination">
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentPage(index + 1)}
                                        className={currentPage === index + 1 ? "active" : ""}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="empty-message">No hay tours registrados 😕</p>
                    )}
                </>
            )}

            <Link to="/create_tour" className="btn secondary__btn"><FaPlus /> Crear nuevo tour</Link>
        </div>
    );
};

export default ManageTours;
