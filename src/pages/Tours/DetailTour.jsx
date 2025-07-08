import React, { useEffect, useState, memo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/config";
import "../../styles/tour/detailTour.css";
import { FaArrowLeft } from "react-icons/fa";

const TourDetail = () => {
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { id } = useParams();

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const { data } = await axios.get(`${BASE_URL}/tours/${id}`);
                setTour(data.data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchTour();
    }, [id]);

    if (loading) return <div className="loader">Cargando detalles del tour...</div>;
    if (error) return <div className="error-message">No se pudo cargar la información del tour. 😥</div>;

    return (
        <div className="tour-detail-container">
            <h2 className="tour-title">{tour.title}</h2>
            <div className="tour-content">
                <div className="tour-info">
                    <Info label="📍 Ciudad" value={tour.city} />
                    <Info label="🏠 Dirección" value={tour.address} />
                    <Info label="⏳ Duración" value={`${tour.duration} días`} />
                    <Info label="📝 Descripción" value={tour.desc} />
                    <Info label="💵 Precio" value={`S/ ${tour.price}`} />
                    <Info label="👥 Tamaño del grupo" value={tour.maxGroupSize} />
                </div>
                <TourImages photos={tour.photos} />
            </div>
            <Link to="/manage_tours" className="back-button">
                <FaArrowLeft style={{ marginRight: "8px" }} />
                Volver a Gestión
            </Link>
        </div>
    );
};

const Info = memo(({ label, value }) => (
    <div className="tour-detail-info-item">
        <span className="label">{label}</span>
        <span className="value">{value}</span>
    </div>
));

const TourImages = memo(({ photos }) => (
    <div className="tour-image-gallery">
        {photos.map((photo, index) => (
            <div key={index} className="image-wrapper">
                <img
                    src={photo.secureUrl}
                    alt={`Foto ${index + 1}`}
                    className="tour-image"
                />
            </div>
        ))}
    </div>
));

export default TourDetail;
