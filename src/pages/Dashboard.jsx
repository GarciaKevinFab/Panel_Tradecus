import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { BASE_URL } from '../utils/config';
import '../styles/dashboard.css';
import { FaUser, FaCalendarAlt, FaMapMarkedAlt, FaEnvelope, FaBell, FaDownload } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f'];

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingStats, setBookingStats] = useState([]);
  const [reviewStats, setReviewStats] = useState([]);
  const [counts, setCounts] = useState({
    bookings: 0,
    users: 0,
    tours: 0,
    subscribers: 0,
    messages: 0,
    incomeByMonth: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounts();
    fetchMonthlyBookings();
    fetchReviewStats();
    fetchIncomeStats();
    setLoading(false);
    // eslint-disable-next-line
  }, []);

  const fetchCounts = async () => {
    try {
      const [bookings, users, tours, subscribers, messages] = await Promise.all([
        axios.get(`${BASE_URL}/booking`, { withCredentials: true }),
        axios.get(`${BASE_URL}/usermobile`, { withCredentials: true }),
        axios.get(`${BASE_URL}/tours`, { withCredentials: true }),
        axios.get(`${BASE_URL}/subscribe`),
        axios.get(`${BASE_URL}/contact`)
      ]);
      setCounts(prev => ({
        ...prev,
        bookings: bookings.data.data.length,
        users: users.data.data.length,
        tours: tours.data.data.length,
        subscribers: subscribers.data.length,
        messages: messages.data.length,
      }));
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  };

  const fetchMonthlyBookings = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/booking/stats/monthly`);
      setBookingStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/review/stats`);
      setReviewStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIncomeStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/booking/stats/income`);
      setCounts(prev => ({ ...prev, incomeByMonth: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  // === DESCARGA INGRESOS COMO EXCEL ===
  const handleDownloadExcel = () => {
    const dataToExport = counts.incomeByMonth.map(item => ({
      Mes: `Mes ${item._id}`,
      Ingreso: item.total
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IngresosPorMes");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `IngresosPorMes.xlsx`);
  };

  return (
    <div className="dashboard">
      <h2>
        <span role="img" aria-label="panel">📊</span> Panel de Control
      </h2>
      {loading ? (
        <div className="loader">Cargando...</div>
      ) : (
        <>
          <div className="dashboard-cards">
            <div className="card card-reservas">
              <FaCalendarAlt /> <span>Reservas:</span> <b>{counts.bookings}</b>
            </div>
            <div className="card card-usuarios">
              <FaUser /> <span>Usuarios:</span> <b>{counts.users}</b>
            </div>
            <div className="card card-tours">
              <FaMapMarkedAlt /> <span>Tours:</span> <b>{counts.tours}</b>
            </div>
            <div className="card card-suscriptores">
              <FaBell /> <span>Suscriptores:</span> <b>{counts.subscribers}</b>
            </div>
            <div className="card card-mensajes">
              <FaEnvelope /> <span>Mensajes:</span> <b>{counts.messages}</b>
            </div>
          </div>

          <div className="date-filter-bar">
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              className="date-picker"
            />
          </div>

          <div className="dashboard-graphs">
            <div className="chart">
              <div className="chart-header">
                <h4>Reservas por mes</h4>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={bookingStats.map(d => ({ month: `Mes ${d._id}`, count: d.count }))}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart">
              <div className="chart-header">
                <h4>Reviews por calificación</h4>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={reviewStats}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {reviewStats.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart">
              <div className="chart-header">
                <h4 style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>Ingresos por mes</span>
                  <button className="excel-btn" onClick={handleDownloadExcel}>
                    <FaDownload style={{ marginRight: 6 }} />
                    Descargar Excel
                  </button>
                </h4>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={counts.incomeByMonth.map(d => ({ month: `Mes ${d._id}`, income: d.total }))}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
