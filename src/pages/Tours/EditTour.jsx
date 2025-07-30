import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../utils/config';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';
import '../../styles/tour/editTour.css';

const EditTour = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [tourData, setTourData] = useState({
        title: '',
        city: '',
        address: '',
        duration: '',
        photos: [],
        desc: '',
        reviews: [],
        price: '',
        maxGroupSize: '',
        featured: false,
    });

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/tours/${id}`);
                setTourData({
                    title: res.data.data.title || '',
                    city: res.data.data.city || '',
                    address: res.data.data.address || '',
                    duration: res.data.data.duration || '',
                    photos: res.data.data.photos || [],
                    desc: res.data.data.desc || '',
                    reviews: res.data.data.reviews || [],
                    price: res.data.data.price || '',
                    maxGroupSize: res.data.data.maxGroupSize || '',
                    featured: res.data.data.featured || false,
                });
            } catch (error) {
                toast.error('Ocurrió un error al obtener el tour');
            } finally {
                setLoading(false);
            }
        };
        fetchTour();
    }, [id]);

    const handleBack = () => {
        navigate("/manage_tours");
    };

    const handleChange = (event) => {
        const { target } = event;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        setTourData({
            ...tourData,
            [name]: value,
        });
    };

    const validate = () => {
        const {
            title, city, address, duration,
            desc, price, maxGroupSize
        } = tourData;
        if (!title || !city || !address || !duration || !desc || !price || !maxGroupSize) {
            toast.error("Completa todos los campos requeridos.");
            return false;
        }
        if (isNaN(duration) || Number(duration) <= 0) {
            toast.error("La duración debe ser un número mayor a 0.");
            return false;
        }
        if (isNaN(price) || Number(price) <= 0) {
            toast.error("El precio debe ser mayor a 0.");
            return false;
        }
        if (isNaN(maxGroupSize) || Number(maxGroupSize) <= 0) {
            toast.error("El máximo de personas debe ser mayor a 0.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;
        setSubmitting(true);

        try {
            await axios.put(`${BASE_URL}/tours/${id}`, tourData);
            toast.success('Tour actualizado exitosamente!');
            setTimeout(() => navigate("/manage_tours"), 800);
        } catch (error) {
            toast.error('Ocurrió un error al actualizar el tour');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading">Cargando...</div>;

    return (
        <div className="EditTour">
            <form onSubmit={handleSubmit} autoComplete="off">
                <label>Título:
                    <input type="text" name="title" value={tourData.title} onChange={handleChange} required />
                </label>
                <label>Ciudad:
                    <input type="text" name="city" value={tourData.city} onChange={handleChange} required />
                </label>
                <label>Dirección:
                    <input type="text" name="address" value={tourData.address} onChange={handleChange} required />
                </label>
                <label>Duración (horas):
                    <input type="number" name="duration" value={tourData.duration} min={1} onChange={handleChange} required />
                </label>
                <label>Descripción:
                    <textarea name="desc" value={tourData.desc} onChange={handleChange} required />
                </label>
                <label>Precio:
                    <input type="number" name="price" value={tourData.price} min={1} onChange={handleChange} required />
                </label>
                <label>Máximo de personas:
                    <input type="number" name="maxGroupSize" value={tourData.maxGroupSize} min={1} onChange={handleChange} required />
                </label>
                <label>Destacado:
                    <input
                        type="checkbox"
                        name="featured"
                        checked={tourData.featured}
                        onChange={handleChange}
                    />
                </label>
                {tourData.photos.length > 0 && (
                    <div className="photos-preview">
                        <label>Fotos actuales:</label>
                        <div className="photos-list">
                            {tourData.photos.map((photo, i) => (
                                <img
                                    key={i}
                                    src={photo.secureUrl || photo.url || photo}
                                    alt={`Foto ${i + 1}`}
                                    width={50}
                                    height={50}
                                    style={{ objectFit: 'cover', borderRadius: 5, margin: "3px" }}
                                />
                            ))}
                        </div>
                    </div>
                )}
                <button type="submit" disabled={submitting}>
                    <FaEdit /> {submitting ? "Actualizando..." : "Actualizar Tour"}
                </button>
            </form>
            <button onClick={handleBack} disabled={submitting}><FaArrowLeft /> Regresar</button>
        </div>
    );
};

export default EditTour;
