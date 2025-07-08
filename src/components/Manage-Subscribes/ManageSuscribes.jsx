import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../utils/config';
import { toast } from 'react-toastify';
import './manageSubscribes.css';
import { MdMarkEmailRead } from 'react-icons/md';

const ManageSubscribes = () => {
    const [subscribes, setSubscribes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscribes = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/subscribe`);
                setSubscribes(res.data);
            } catch (error) {
                toast.error("Ocurrió un error al obtener las suscripciones");
            } finally {
                setLoading(false);
            }
        };

        fetchSubscribes();
    }, []);

    return (
        <div className="ManageSubscribes">
            <h2><MdMarkEmailRead style={{ verticalAlign: 'middle' }} /> Lista de Suscripciones</h2>

            {loading ? (
                <p className="loading">Cargando suscripciones...</p>
            ) : subscribes.length === 0 ? (
                <p className="no-data">No hay correos suscritos aún.</p>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>📧 Correo Electrónico</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribes.map((subscribe) => (
                                <tr key={subscribe._id}>
                                    <td>{subscribe.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageSubscribes;
