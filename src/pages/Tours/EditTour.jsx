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

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.put(`${BASE_URL}/tours/${id}`, tourData);
            toast.success('Tour actualizado exitosamente!');
            navigate("/manage_tours");
        } catch (error) {
            toast.error('Ocurrió un error al actualizar el tour');
        }
    };

    return (
        <div className="EditTour">
            <form onSubmit={handleSubmit}>
                <label>Titulo:
                    <input type="text" name="title" value={tourData.title} onChange={handleChange} required />
                </label>
                <label>Cuidad:
                    <input type="text" name="city" value={tourData.city} onChange={handleChange} required />
                </label>
                <label>Dirección:
                    <input type="text" name="address" value={tourData.address} onChange={handleChange} required />
                </label>
                <label>Duración (horas):
                    <input type="number" name="duration" value={tourData.duration} onChange={handleChange} required />
                </label>
                <label>Descripción:
                    <textarea name="desc" value={tourData.desc} onChange={handleChange} required />
                </label>
                <label>Precio:
                    <input type="number" name="price" value={tourData.price} onChange={handleChange} required />
                </label>
                <label>Máximo de personas:
                    <input type="number" name="maxGroupSize" value={tourData.maxGroupSize} onChange={handleChange} required />
                </label>
                <label>Destacado:
                    <input
                        type="checkbox"
                        name="featured"
                        checked={tourData.featured}
                        onChange={handleChange}
                    />
                </label>
                <button type="submit"><FaEdit /> Actualizar Tour</button>
            </form>
            <button onClick={handleBack}><FaArrowLeft /> Regresar</button>
        </div>
    );
};

export default EditTour;
