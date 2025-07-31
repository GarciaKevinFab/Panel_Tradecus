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
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    if (token) {
      localStorage.setItem("accessToken", token);
      window.history.replaceState({}, document.title, "/dashboard");
    }
  }, []);

  const [selectedDate, setSelectedDate] = useState(new Date());

  // === NUEVO: Selector para reservas ===
  const [bookingType, setBookingType] = useState('monthly'); // monthly, fortnight, daily
  const [bookingStats, setBookingStats] = useState([]);

  // === Lo de ingresos que ya tenías ===
  const [incomeType, setIncomeType] = useState('monthly');
  const [counts, setCounts] = useState({
    bookings: 0,
    users: 0,
    tours: 0,
    subscribers: 0,
    messages: 0,
    incomeByMonth: []
  });

  const [reviewStats, setReviewStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("accessToken");

  // === Carga inicial ===
  useEffect(() => {
    fetchCounts();
    fetchBookingsStats();
    fetchReviewStats();
    setLoading(false);
    // eslint-disable-next-line
  }, []);

  // === Cuando cambia el rango de reservas (bookingType) ===
  useEffect(() => {
    fetchBookingsStats();
    // eslint-disable-next-line
  }, [bookingType]);

  // === Cuando cambia el rango de ingresos (incomeType) ===
  useEffect(() => {
    fetchIncomeStats();
    // eslint-disable-next-line
  }, [incomeType]);

  // === FUNCIONES BACKEND ===
  const fetchCounts = async () => {
    try {
      const token = getToken();
      const [bookings, users, tours, subscribers, messages] = await Promise.all([
        axios.get(`${BASE_URL}/booking`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BASE_URL}/usermobile`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BASE_URL}/tours`, { headers: { Authorization: `Bearer ${token}` } }),
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

  // === RESERVAS ===
  const fetchBookingsStats = async () => {
    try {
      const token = getToken();
      let url = `${BASE_URL}/booking/stats/monthly`;
      if (bookingType === 'daily') url = `${BASE_URL}/booking/stats/bookings/daily`;
      if (bookingType === 'fortnight') url = `${BASE_URL}/booking/stats/bookings/fortnight`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setBookingStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // === REVIEWS ===
  const fetchReviewStats = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${BASE_URL}/review/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviewStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // === INGRESOS ===
  const fetchIncomeStats = async () => {
    try {
      const token = getToken();
      let url = `${BASE_URL}/booking/stats/income`;
      if (incomeType === 'daily') url += '/daily';
      if (incomeType === 'fortnight') url += '/fortnight';
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setCounts(prev => ({ ...prev, incomeByMonth: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  // === LABELS ===
  const getBookingLabel = d => {
    if (!d._id) return "";
    if (bookingType === "monthly") return `Mes ${d._id}`;
    if (bookingType === "fortnight") return `Q${d._id.fortnight} - ${d._id.month}/${d._id.year}`;
    if (bookingType === "daily") return `${d._id.day}/${d._id.month}/${d._id.year}`;
    return "";
  };

  const getIncomeLabel = d => {
    if (!d._id) return "";
    if (incomeType === "monthly") return `Mes ${d._id}`;
    if (incomeType === "fortnight") return `Q${d._id.fortnight} - ${d._id.month}/${d._id.year}`;
    if (incomeType === "daily") return `${d._id.day}/${d._id.month}/${d._id.year}`;
    return "";
  };

  // === DESCARGAS ===
  const handleDownloadBookingsExcel = () => {
    const dataToExport = bookingStats.map(item => ({
      Periodo: getBookingLabel(item),
      Reservas: item.count
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `ReservasPor${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}.xlsx`);
  };

  const handleDownloadIncomeExcel = () => {
    const dataToExport = counts.incomeByMonth.map(item => ({
      Periodo: getIncomeLabel(item),
      Ingreso: item.total
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ingresos");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `IngresosPor${incomeType.charAt(0).toUpperCase() + incomeType.slice(1)}.xlsx`);
  };

  // === UI ===
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

          {/* === Selector de reservas === */}
          <div className="booking-type-selector" style={{ marginBottom: 16 }}>
            <label style={{ marginRight: 8 }}>Ver reservas por: </label>
            <select value={bookingType} onChange={e => setBookingType(e.target.value)}>
              <option value="monthly">Mes</option>
              <option value="fortnight">Quincena</option>
              <option value="daily">Día</option>
            </select>
          </div>

          <div className="dashboard-graphs">

            <div className="chart">
              <div className="chart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Reservas por {bookingType === 'monthly' ? 'mes' : bookingType === 'fortnight' ? 'quincena' : 'día'}</span>
                <button className="excel-btn" onClick={handleDownloadBookingsExcel}>
                  <FaDownload style={{ marginRight: 6 }} />
                  Descargar Excel
                </button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={bookingStats.map(d => ({
                  label: getBookingLabel(d),
                  count: d.count
                }))}>
                  <XAxis dataKey="label" />
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

            {/* === Selector de ingresos === */}
            <div className="income-type-selector" style={{ marginBottom: 16 }}>
              <label style={{ marginRight: 8 }}>Ver ingresos por: </label>
              <select value={incomeType} onChange={e => setIncomeType(e.target.value)}>
                <option value="monthly">Mes</option>
                <option value="fortnight">Quincena</option>
                <option value="daily">Día</option>
              </select>
            </div>

            <div className="chart">
              <div className="chart-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Ingresos por {incomeType === 'monthly' ? 'mes' : incomeType === 'fortnight' ? 'quincena' : 'día'}</span>
                <button className="excel-btn" onClick={handleDownloadIncomeExcel}>
                  <FaDownload style={{ marginRight: 6 }} />
                  Descargar Excel
                </button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={counts.incomeByMonth.map(d => ({
                  label: getIncomeLabel(d), income: d.total
                }))}>
                  <XAxis dataKey="label" />
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
