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

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.post(`${BASE_URL}/usermobile/register`, userData);
            toast.success('Usuario creado exitosamente!');
            setUserData({
                username: '',
                email: '',
                password: '',
                role: 'user',
            });
            navigate("/manage_users");
        } catch (error) {
            toast.error('Ocurrió un error al crear el usuario');
        }
    };


    return (
        <div className="CreateUser">
            <form onSubmit={handleSubmit} className="user-form">
                <div className="form-field">
                    <label>Nombre de Usuario:</label>
                    <input type="text" name="username" value={userData.username} onChange={handleChange} required />
                </div>
                <div className="form-field">
                    <label>Email:</label>
                    <input type="email" name="email" value={userData.email} onChange={handleChange} required />
                </div>
                <div className="form-field">
                    <label>Contraseña:</label>
                    <input type="password" name="password" value={userData.password} onChange={handleChange} required />
                </div>
                <div className="form-field">
                    <label>Rol:</label>
                    <select name="role" value={userData.role} onChange={handleChange} required>
                        <option value="user">Usuario</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button type="submit" className="btn-create"><FaUserPlus /> Crear usuario</button>
            </form>
            <button onClick={handleBack} className="btn-back"><FaArrowLeft /> Regresar</button>
        </div>
    );
};

export default CreateUser;
