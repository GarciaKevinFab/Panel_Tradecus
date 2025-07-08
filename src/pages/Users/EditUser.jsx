import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../utils/config';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import '../../styles/user/editUser.css'; // Asegúrate de crear este archivo en la misma carpeta del componente

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/manage_users");
    };

    const [userData, setUserData] = useState({
        username: '',
        email: '',
        role: '',
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const [usersRes, userMobileRes] = await Promise.all([
                    axios.get(`${BASE_URL}/users`),
                    axios.get(`${BASE_URL}/usermobile`),
                ]);

                const allUsers = [...usersRes.data.data, ...userMobileRes.data.data];
                const user = allUsers.find(u => u._id === id);

                if (!user) {
                    toast.error('Usuario no encontrado');
                    return;
                }

                setUserData({
                    username: user.username || '',
                    email: user.email || '',
                    role: user.role || '',
                });
            } catch (error) {
                toast.error('Error al obtener los datos del usuario');
            }
        };

        fetchUser();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setUserData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.put(`${BASE_URL}/users/${id}`, userData);
            toast.success('Usuario actualizado exitosamente!');
            navigate("/manage_users");
        } catch (error) {
            toast.error('Ocurrió un error al actualizar el usuario');
        }
    };

    return (
        <div className="EditUser">
            <form onSubmit={handleSubmit} className="user-form">
                <input
                    type="text"
                    name="username"
                    value={userData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    required
                />
                <select
                    name="role"
                    value={userData.role}
                    onChange={handleChange}
                    required
                >
                    <option value="">--Seleccione un rol--</option>
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                </select>
                <button type="submit" className="btn-save"><FaSave /> Actualizar Usuario</button>
            </form>
            <button onClick={handleBack} className="btn-back"><FaArrowLeft /> Regresar</button>
        </div>
    );
};

export default EditUser;
