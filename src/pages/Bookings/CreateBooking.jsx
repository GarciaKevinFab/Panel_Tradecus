import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; // Quitado useLocation
import axios from "axios";
import { toast } from "react-toastify";
import { Form, FormGroup, Button } from "reactstrap";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import IdentityField from "../../components/Identity/IdentityField";
import { BASE_URL } from "../../utils/config";
import { AuthContext } from "../../context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/bookings/createBooking.css";

const CreateBooking = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [tours, setTours] = useState([]);
  const [tourType, setTourType] = useState("private");
  const [selectedTour, setSelectedTour] = useState(null);
  const [maxGuests, setMaxGuests] = useState(2); // por defecto para privado
  const [booking, setBooking] = useState({
    userId: user ? user._id : "",
    userEmail: user ? user.email : "",
    tourName: "",
    phone: "",
    guestSize: 1,
    bookAt: new Date(),
  });
  const [dni, setDni] = useState(new Array(1).fill(""));
  const [userData, setUserData] = useState(new Array(1).fill({}));
  const [documentTypes, setDocumentTypes] = useState(new Array(1).fill("dni"));

  const handleBack = () => {
    navigate("/manage_bookings");
  };

  useEffect(() => {
    axios
      .get(`${BASE_URL}/tours`, { withCredentials: true })
      .then((response) => {
        if (response.data && Array.isArray(response.data.data)) {
          setTours(response.data.data);
        } else {
          toast.error("No se pudieron cargar los tours.");
        }
      })
      .catch(() => {
        toast.error("No se pudieron cargar los tours.");
      });
  }, []);

  // Cuando se selecciona un tour, actualizar maxGuests
  useEffect(() => {
    if (booking.tourName) {
      const tourObj = tours.find(t => t.title === booking.tourName);
      setSelectedTour(tourObj || null);
      let max = tourType === "private" ? 2 : (tourObj?.maxGroupSize || 1);
      setMaxGuests(max);

      if (booking.guestSize > max) {
        setBooking(prev => ({ ...prev, guestSize: max }));
        toast.info(`El máximo de personas para este tour es ${max}.`);
      }
    }
    // eslint-disable-next-line
  }, [booking.tourName, tours, tourType, booking.guestSize]);

  // Cuando cambia guestSize, actualiza arrays de dni y userData
  useEffect(() => {
    setDni(new Array(booking.guestSize).fill(""));
    setUserData(new Array(booking.guestSize).fill({}));
    setDocumentTypes(new Array(booking.guestSize).fill("dni"));
  }, [booking.guestSize]);

  const handleTourTypeChange = (e) => {
    const newTourType = e.target.value;
    setTourType(newTourType);
    let max = 1;
    if (newTourType === "private") {
      max = 2;
    } else if (selectedTour) {
      max = selectedTour.maxGroupSize || 1;
    }
    setMaxGuests(max);
    if (booking.guestSize > max) {
      setBooking((prev) => ({ ...prev, guestSize: max }));
      toast.info(`El máximo de personas para este tipo de tour es ${max}.`);
    }
  };

  const handleGuestSizeChange = (e) => {
    const newGuestSize = parseInt(e.target.value, 10);
    if (newGuestSize <= maxGuests && newGuestSize >= 1) {
      setBooking((prev) => ({ ...prev, guestSize: newGuestSize }));
    } else {
      toast.error(`Número de invitados excede el máximo permitido (${maxGuests}).`);
    }
  };

  const isValidLength = (doc, type) =>
    (type === "dni" && doc.length === 8) ||
    (type === "carnet" && doc.length === 9);

  const allDocumentsValid = dni.every((d, i) => d && isValidLength(d, documentTypes[i]));
  const allUserDataValid = userData.every(d => d?.nombres && d?.apellidoPaterno && d?.apellidoMaterno);
  const isBookingDataValid =
    allDocumentsValid &&
    allUserDataValid &&
    /^\d{9}$/.test(booking.phone);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!booking.tourName) {
      toast.error("Selecciona un tour.");
      return;
    }

    if (!isBookingDataValid) {
      toast.error("Por favor, completa correctamente los datos de todos los participantes.");
      return;
    }

    const bookingData = {
      ...booking,
      userData: userData.filter(
        (item) => item.nombres && item.apellidoPaterno && item.apellidoMaterno
      ),
      tourType: tourType,
    };

    axios
      .post(`${BASE_URL}/booking`, bookingData, { withCredentials: true })
      .then(() => {
        toast.success("Reserva creada con éxito.");
        setBooking((prev) => ({
          ...prev,
          tourName: "",
          phone: "",
          guestSize: 1,
        }));
        setUserData(new Array(1).fill({}));
        setDni(new Array(1).fill(""));
        setDocumentTypes(new Array(1).fill("dni"));
        navigate('/manage_bookings');
      })
      .catch(() => {
        toast.error("Ocurrió un error al crear la reserva.");
      });
  };

  return (
    <div className="container">
      <h2>Crear nueva reserva</h2>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <label>Nombre del Tour:</label>
          <select
            required
            value={booking.tourName}
            onChange={(e) =>
              setBooking((prev) => ({ ...prev, tourName: e.target.value }))
            }
          >
            <option value="">Seleccione un tour</option>
            {Array.isArray(tours) &&
              tours.map((tour) => (
                <option key={tour._id} value={tour.title}>
                  {tour.title}
                </option>
              ))}
          </select>
        </FormGroup>
        <FormGroup>
          <label>Tipo de Tour:</label>
          <select required value={tourType} onChange={handleTourTypeChange}>
            <option value="private">Privado (1-2 personas)</option>
            <option value="corporate">Corporativo (hasta el máximo del tour)</option>
          </select>
        </FormGroup>

        <FormGroup>
          <label>Número de invitados:</label>
          <input
            type="number"
            required
            min="1"
            max={maxGuests}
            value={booking.guestSize}
            onChange={handleGuestSizeChange}
          />
          <div style={{ fontSize: 12, color: "#888" }}>
            Máximo permitido para este tour: {maxGuests}
          </div>
        </FormGroup>
        <FormGroup>
          <label>Teléfono:</label>
          <input
            type="tel"
            required
            value={booking.phone}
            onChange={(e) =>
              setBooking((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="Ej: 987654321"
            maxLength={9}
          />
        </FormGroup>
        <FormGroup>
          <label>Registre a los participantes del Tour:</label>
          {Array.from({ length: booking.guestSize }, (_, i) => (
            <IdentityField
              key={i}
              index={i}
              dni={dni}
              setDni={setDni}
              userData={userData}
              setUserData={setUserData}
              documentTypes={documentTypes}
              setDocumentTypes={setDocumentTypes}
            />
          ))}
        </FormGroup>
        <Button onClick={handleBack} className="secondary">
          <FaArrowLeft /> Regresar
        </Button>
        <Button type="submit" >
          <FaSave /> Crear Reserva
        </Button>
      </Form>
    </div>
  );
};

export default CreateBooking;
