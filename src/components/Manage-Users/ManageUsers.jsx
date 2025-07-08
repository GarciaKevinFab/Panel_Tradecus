import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/config';
import 'react-toastify/dist/ReactToastify.css';
import './manageUsers.css';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const [usersRes, userMobileRes] = await Promise.all([
                    axios.get(`${BASE_URL}/users`),
                    axios.get(`${BASE_URL}/usermobile`),
                ]);

                // Etiqueta el origen de cada usuario
                const usersWithSource = usersRes.data.data.map(user => ({ ...user, source: 'users' }));
                const userMobilesWithSource = userMobileRes.data.data.map(user => ({ ...user, source: 'mobile' }));

                const allUsers = [...usersWithSource, ...userMobilesWithSource];
                setUsers(allUsers);
            } catch (error) {
                toast.error("Error al obtener los usuarios");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);


    const handleDelete = async (id, source) => {
        try {
            const route = source === 'mobile' ? 'usermobile' : 'users';

            await axios.delete(`${BASE_URL}/${route}/${id}`);

            toast.success('Usuario eliminado exitosamente!');
            setUsers(prev => prev.filter(user => user._id !== id));
        } catch (error) {
            toast.error('Ocurrió un error al eliminar el usuario');
        }
    };


    return (
        <div className="ManageUsers">
            <h2>👥 Gestión de Usuarios</h2>

            {loading ? (
                <p className="loading">Cargando usuarios...</p>
            ) : users.length === 0 ? (
                <p className="no-data">No hay usuarios registrados.</p>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre de Usuario</th>
                                <th>Email</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td className="actions">
                                        <Link to={`/edit_user/${user._id}`} className="btn edit-btn">
                                            <FaEdit /> Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(user._id, user.source)}
                                            className="btn delete-btn"
                                        >
                                            <FaTrashAlt /> Eliminar
                                        </button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="btn-wrapper">
                <Link to="/create_user" className="btn add-btn">
                    <FaPlus /> Crear nuevo usuario
                </Link>
            </div>
        </div>
    );
};

export default ManageUsers;
