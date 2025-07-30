import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../utils/config';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import '../../styles/user/editUser.css';

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // userSource = 'users' | 'usermobile'
    const [userSource, setUserSource] = useState('users');
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
                const users = usersRes.data.data || [];
                const userMobiles = userMobileRes.data.data || [];

                let found = users.find(u => u._id === id);
                if (found) {
                    setUserSource('users');
                } else {
                    found = userMobiles.find(u => u._id === id);
                    if (found) setUserSource('usermobile');
                }

                if (!found) {
                    toast.error('Usuario no encontrado');
                    setLoading(false);
                    return;
                }

                setUserData({
                    username: found.username || '',
                    email: found.email || '',
                    role: found.role || '',
                });
            } catch (error) {
                toast.error('Error al obtener los datos del usuario');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleBack = () => {
        navigate("/manage_users");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setUserData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const validate = () => {
        const { username, email, role } = userData;
        if (!username || !email || !role) {
            toast.error("Completa todos los campos.");
            return false;
        }
        const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            toast.error("Email inválido.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const endpoint = userSource === 'usermobile' ? 'usermobile' : 'users';
            await axios.put(`${BASE_URL}/${endpoint}/${id}`, userData);
            toast.success('Usuario actualizado exitosamente!');
            setTimeout(() => navigate("/manage_users"), 800);
        } catch (error) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Ocurrió un error al actualizar el usuario');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading">Cargando usuario...</div>;

    return (
        <div className="EditUser">
            <form onSubmit={handleSubmit} className="user-form" autoComplete="off">
                <div className="form-field">
                    <label>Nombre de Usuario:</label>
                    <input
                        type="text"
                        name="username"
                        value={userData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-field">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-field">
                    <label>Rol:</label>
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
                </div>
                <button type="submit" className="btn-save" disabled={submitting}>
                    <FaSave /> {submitting ? "Actualizando..." : "Actualizar Usuario"}
                </button>
            </form>
            <button onClick={handleBack} className="btn-back" disabled={submitting}>
                <FaArrowLeft /> Regresar
            </button>
        </div>
    );
};

export default EditUser;
