import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../utils/config';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { FaArrowLeft, FaUserPlus } from 'react-icons/fa';
import '../../styles/user/createUser.css';

const CreateUser = () => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user',
    });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/manage_users");
    };

    const handleChange = (event) => {
        setUserData({
            ...userData,
            [event.target.name]: event.target.value,
        });
    };

    // Validación avanzada
    const validate = () => {
        const { username, email, password } = userData;
        if (!username || !email || !password) {
            toast.error("Todos los campos son obligatorios.");
            return false;
        }
        // Email válido
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            toast.error("Email inválido.");
            return false;
        }
        // Contraseña mínimo 6 caracteres (mejor aún si exiges más)
        if (password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await axios.post(`${BASE_URL}/usermobile/register`, userData);
            toast.success('Usuario creado exitosamente!');
            setUserData({
                username: '',
                email: '',
                password: '',
                role: 'user',
            });
            setTimeout(() => navigate("/manage_users"), 900);
        } catch (error) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Ocurrió un error al crear el usuario');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="CreateUser">
            <form onSubmit={handleSubmit} className="user-form" autoComplete="off">
                <div className="form-field">
                    <label>Nombre de Usuario:</label>
                    <input
                        type="text"
                        name="username"
                        value={userData.username}
                        onChange={handleChange}
                        required
                        autoComplete="new-username"
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
                        autoComplete="new-email"
                    />
                </div>
                <div className="form-field">
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        name="password"
                        value={userData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        autoComplete="new-password"
                    />
                </div>
                <div className="form-field">
                    <label>Rol:</label>
                    <select name="role" value={userData.role} onChange={handleChange} required>
                        <option value="user">Usuario</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="btn-create"
                    disabled={loading}
                    style={{ marginRight: 10 }}
                >
                    <FaUserPlus /> {loading ? "Creando..." : "Crear usuario"}
                </button>
            </form>
            <button onClick={handleBack} className="btn-back" disabled={loading}>
                <FaArrowLeft /> Regresar
            </button>
        </div>
    );
};

export default CreateUser;
