import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Layout from '../components/Layout/Layout';
import Dashboard from '../pages/Dashboard';
import ManageTours from '../components/Manage-Tours/ManageTours';
import CreateTour from '../pages/Tours/CreateTour.jsx';
import EditTour from '../pages/Tours/EditTour.jsx';
import DeleteTour from '../pages/Tours/DeleteTour.jsx';
import ManageUsers from '../components/Manage-Users/ManageUsers.jsx';
import CreateUser from '../pages/Users/CreateUser.jsx';
import EditUser from '../pages/Users/EditUser.jsx';
import ManageReviews from '../components/Manage-Reviews/ManageReviews.jsx';
import ManageBookings from '../components/Manage-Bookings/ManageBookings.jsx';
import ManageSubscribes from '../components/Manage-Subscribes/ManageSuscribes.jsx';
import ManageContacts from '../components/Manage-Contacts/ManageContacts.jsx';
import ContactDetail from '../pages/Contacts/DetailContact.jsx';
import TourDetail from '../pages/Tours/DetailTour.jsx';
import CreateBooking from '../pages/Bookings/CreateBooking.jsx';
import RescheduleBooking from '../pages/Bookings/RescheduleBooking.jsx';

const Routers = () => {
    return (
        <Routes>
            <Route path='/' element={<Navigate to='/login' />} />
            <Route path='/login' element={<Login />} />
            <Route path='/' element={<Layout />}>
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/manage_tours' element={<ManageTours />} />
                <Route path='/create_tour' element={<CreateTour />} />
                <Route path='/edit_tour/:id' element={<EditTour />} />
                <Route path='/delete_tour/:id' element={<DeleteTour />} />
                <Route path='/detail_tour/:id' element={<TourDetail />} />

                <Route path='/manage_users' element={<ManageUsers />} />
                <Route path='/create_user' element={<CreateUser />} />
                <Route path='/edit_user/:id' element={<EditUser />} />

                <Route path='/manage_reviews' element={<ManageReviews />} />

                <Route path='/manage_bookings' element={<ManageBookings />} />
                <Route path='/create_booking' element={<CreateBooking />} />
                <Route path='/Reschedule_booking' element={<RescheduleBooking />} />

                <Route path='/manage_subscribes' element={<ManageSubscribes />} />
                <Route path='/manage_contacts' element={<ManageContacts />} />
                <Route path='/detail_contact/:id' element={<ContactDetail />} />
            </Route>

        </Routes>
    );
};

export default Routers;
