import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { BASE_URL } from '../utils/config';
import '../styles/dashboard.css';
import { FaUser, FaCalendarAlt, FaMapMarkedAlt, FaEnvelope, FaBell, FaDownload, FaSignOutAlt } from 'react-icons/fa';
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
  const [downloading, setDownloading] = useState(false);

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
    setDownloading(true);
    setTimeout(() => { // animación breve
      const dataToExport = bookingStats.map(item => ({
        Periodo: getBookingLabel(item),
        Reservas: item.count
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `ReservasPor${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}.xlsx`);
      setDownloading(false);
    }, 900);
  };

  const handleDownloadIncomeExcel = () => {
    setDownloading(true);
    setTimeout(() => {
      const dataToExport = counts.incomeByMonth.map(item => ({
        Periodo: getIncomeLabel(item),
        Ingreso: item.total
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ingresos");
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `IngresosPor${incomeType.charAt(0).toUpperCase() + incomeType.slice(1)}.xlsx`);
      setDownloading(false);
    }, 900);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  };

  // UI ESTADOS VACÍOS
  const EmptyState = ({ text }) => (
    <div className="empty-state">
      <span role="img" aria-label="no-data">📉</span>
      <p>{text}</p>
    </div>
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>
          <span role="img" aria-label="panel">📊</span> Bienvenido, Kevin
        </h2>
        <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
          <FaSignOutAlt /> Logout
        </button>
        <div className="dashboard-filters">
          <div>
            <label>Reservas por: </label>
            <select value={bookingType} onChange={e => setBookingType(e.target.value)}>
              <option value="monthly">Mes</option>
              <option value="fortnight">Quincena</option>
              <option value="daily">Día</option>
            </select>
          </div>
          <div>
            <label>Ingresos por: </label>
            <select value={incomeType} onChange={e => setIncomeType(e.target.value)}>
              <option value="monthly">Mes</option>
              <option value="fortnight">Quincena</option>
              <option value="daily">Día</option>
            </select>
          </div>
          <div>
            <label>Fecha: </label>
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              className="date-picker"
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="loader">
          <svg width="42" height="42" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" stroke="#4e73df" strokeWidth="4" fill="none" opacity=".2" />
            <circle cx="20" cy="20" r="18" stroke="#4e73df" strokeWidth="4" fill="none" strokeDasharray="90, 150" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" values="0 20 20;360 20 20" dur="1s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div>Cargando datos...</div>
        </div>
      ) : (
        <>
          <div className="dashboard-cards">
            <div className="card card-reservas">
              <span className="card-icon glass"><FaCalendarAlt /></span>
              <span>Reservas</span>
              <b>{counts.bookings}</b>
            </div>
            <div className="card card-usuarios">
              <span className="card-icon glass"><FaUser /></span>
              <span>Usuarios</span>
              <b>{counts.users}</b>
            </div>
            <div className="card card-tours">
              <span className="card-icon glass"><FaMapMarkedAlt /></span>
              <span>Tours</span>
              <b>{counts.tours}</b>
            </div>
            <div className="card card-suscriptores">
              <span className="card-icon glass"><FaBell /></span>
              <span>Suscriptores</span>
              <b>{counts.subscribers}</b>
            </div>
            <div className="card card-mensajes">
              <span className="card-icon glass"><FaEnvelope /></span>
              <span>Mensajes</span>
              <b>{counts.messages}</b>
            </div>
          </div>

          <div className="dashboard-graphs">
            {/* CHART 1: RESERVAS */}
            <div className="chart">
              <div className="chart-header">
                <span>Reservas por {bookingType === 'monthly' ? 'mes' : bookingType === 'fortnight' ? 'quincena' : 'día'}</span>
                <button className="excel-btn" onClick={handleDownloadBookingsExcel} disabled={downloading}>
                  {downloading ? (
                    <span className="spinner"></span>
                  ) : (
                    <FaDownload style={{ marginRight: 6 }} />
                  )}
                  Descargar Excel
                </button>
              </div>
              {bookingStats.length === 0 ? (
                <EmptyState text="No hay datos de reservas para este periodo." />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={bookingStats.map(d => ({
                      label: getBookingLabel(d),
                      count: d.count
                    }))}
                    isAnimationActive={true}
                  >
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* CHART 2: REVIEWS */}
            <div className="chart">
              <div className="chart-header">
                <h4>Reviews por calificación</h4>
              </div>
              {reviewStats.length === 0 ? (
                <EmptyState text="No hay reviews disponibles." />
              ) : (
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
                      isAnimationActive={true}
                    >
                      {reviewStats.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* CHART 3: INGRESOS */}
            <div className="chart">
              <div className="chart-header">
                <span>Ingresos por {incomeType === 'monthly' ? 'mes' : incomeType === 'fortnight' ? 'quincena' : 'día'}</span>
                <button className="excel-btn" onClick={handleDownloadIncomeExcel} disabled={downloading}>
                  {downloading ? (
                    <span className="spinner"></span>
                  ) : (
                    <FaDownload style={{ marginRight: 6 }} />
                  )}
                  Descargar Excel
                </button>
              </div>
              {counts.incomeByMonth.length === 0 ? (
                <EmptyState text="No hay datos de ingresos para este periodo." />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={counts.incomeByMonth.map(d => ({
                      label: getIncomeLabel(d),
                      income: d.total
                    }))}
                    isAnimationActive={true}
                  >
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="income" fill="#21c36a" radius={[7, 7, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
