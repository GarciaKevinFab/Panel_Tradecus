import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../utils/config';
import '../../styles/tour/deleteTour.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DeleteTour = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deleting, setDeleting] = useState(false);

    const handleBack = () => {
        navigate("/manage_tours");
    };

    const handleDelete = async () => {
        // Si quieres usar tu propio ConfirmAlert, reemplaza el window.confirm por él.
        const confirmed = window.confirm("¿Seguro que deseas eliminar este tour? Esta acción es irreversible.");
        if (!confirmed) return;

        setDeleting(true);
        try {
            await axios.delete(`${BASE_URL}/tours/${id}`);
            toast.success('Tour eliminado exitosamente!');
            setTimeout(() => navigate("/manage_tours"), 1000);
        } catch (error) {
            toast.error('Ocurrió un error al eliminar el tour');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="DeleteTour">
            <h2>¿Estás seguro de que quieres eliminar este tour?</h2>
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn delete-btn"
                style={{ marginRight: 10 }}
            >
                {deleting ? "Eliminando..." : "Eliminar tour"}
            </button>
            <button onClick={handleBack} className="btn back-btn" disabled={deleting}>
                Regresar
            </button>
        </div>
    );
};

export default DeleteTour;
