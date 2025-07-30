import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/config";
import "../../styles/tour/createTour.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateTour = () => {
  const [tourData, setTourData] = useState({
    title: "",
    city: "",
    address: "",
    duration: "",
    photos: [],
    desc: "",
    price: "",
    maxGroupSize: "",
    featured: false,
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleBack = (e) => {
    e.preventDefault();
    navigate("/manage_tours");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setTourData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validImages = selectedFiles.filter((file) => file.type.startsWith("image/"));

    if (validImages.length !== selectedFiles.length) {
      toast.error("Solo se permiten archivos de imagen.");
      return;
    }

    setTourData((prevData) => ({
      ...prevData,
      photos: validImages,
    }));

    setImagePreviews(validImages.map((file) => URL.createObjectURL(file)));
  };

  const validate = () => {
    const {
      title, city, address, duration,
      desc, price, maxGroupSize, photos
    } = tourData;
    if (!title || !city || !address || !duration ||
      !desc || !price || !maxGroupSize || photos.length === 0
    ) {
      toast.error("Completa todos los campos requeridos y sube al menos una foto.");
      return false;
    }
    if (isNaN(duration) || Number(duration) <= 0) {
      toast.error("La duración debe ser un número mayor a 0.");
      return false;
    }
    if (isNaN(price) || Number(price) <= 0) {
      toast.error("El precio debe ser mayor a 0.");
      return false;
    }
    if (isNaN(maxGroupSize) || Number(maxGroupSize) <= 0) {
      toast.error("El tamaño máximo de grupo debe ser mayor a 0.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(tourData).forEach(([key, value]) => {
      if (key === "photos") return; // Maneja fotos aparte
      formData.append(key, value);
    });
    tourData.photos.forEach((photo) => {
      formData.append("photos", photo);
    });

    try {
      await axios.post(`${BASE_URL}/tours`, formData);
      toast.success("Tour creado exitosamente!");
      navigate("/manage_tours");
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Ocurrió un error al crear el tour");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="CreateTour">
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="form-column">
          <label>
            Título:<span className="required">*</span>
            <input
              type="text"
              name="title"
              value={tourData.title}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Ciudad:<span className="required">*</span>
            <input
              type="text"
              name="city"
              value={tourData.city}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Dirección:<span className="required">*</span>
            <input
              type="text"
              name="address"
              value={tourData.address}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Duración (en horas):<span className="required">*</span>
            <input
              type="number"
              name="duration"
              min={1}
              value={tourData.duration}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Descripción:<span className="required">*</span>
            <textarea
              name="desc"
              value={tourData.desc}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div className="form-column">
          <label>
            Precio:<span className="required">*</span>
            <input
              type="number"
              name="price"
              min={1}
              value={tourData.price}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Máximo tamaño del grupo:<span className="required">*</span>
            <input
              type="number"
              name="maxGroupSize"
              min={1}
              value={tourData.maxGroupSize}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            ¿Destacado?
            <input
              type="checkbox"
              name="featured"
              checked={tourData.featured}
              onChange={handleChange}
            />
          </label>
          <label>
            Fotos:<span className="required">*</span>
            <input
              type="file"
              name="photos"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              required
            />
          </label>
          <div className="image-previews">
            {imagePreviews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`Imagen ${index}`}
                width="40"
                height="40"
                style={{ objectFit: "cover", margin: "0 6px 6px 0", borderRadius: 6 }}
              />
            ))}
          </div>
        </div>

        <div className="btn-form">
          <input
            type="submit"
            value={isSubmitting ? "Creando..." : "Crear tour"}
            disabled={isSubmitting}
            className="btn primary__btn"
          />
          <button onClick={handleBack} className="back" disabled={isSubmitting}>
            Regresar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTour;
