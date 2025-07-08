// Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = () => {
    return (
        <div className="layout">
            <Sidebar />
            <div className="main__layout">
                <Navbar />
                <div className="content">
                    <Outlet /> {/* Renderiza las rutas hijas aquí */}
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
};

export default Layout;
