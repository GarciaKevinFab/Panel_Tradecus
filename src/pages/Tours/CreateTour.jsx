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

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/manage_tours");
  };

  const handleChange = (event) => {
    setTourData({
      ...tourData,
      [event.target.name]: event.target.value,
    });
  };

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;

    if (selectedFiles && selectedFiles.length > 0) {
      const fileList = Array.from(selectedFiles);
      setTourData((prevData) => ({
        ...prevData,
        photos: fileList,
      }));

      // Mostrar la vista previa de las imágenes seleccionadas
      const fileURLs = Array.from(selectedFiles).map((file) =>
        URL.createObjectURL(file)
      );
      setImagePreviews(fileURLs);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    Object.keys(tourData).forEach((key) => formData.append(key, tourData[key]));

    tourData.photos.forEach((photo) => {
      formData.append("photos", photo);
    });

    try {
      await axios.post(`${BASE_URL}/tours`, formData);
      toast.success("Tour creado exitosamente!");
      navigate("/manage_tours"); // Redirect after successful creation
    } catch (error) {
      toast.error("Ocurrió un error al crear el tour");
    }
  };
  return (
    <div className="CreateTour">
      <form onSubmit={handleSubmit}>
        <div className="form-column">
          <label>
            Título:
            <input
              type="text"
              name="title"
              value={tourData.title}
              onChange={handleChange}
            />
          </label>
          <label>
            Ciudad:
            <input
              type="text"
              name="city"
              value={tourData.city}
              onChange={handleChange}
            />
          </label>
          <label>
            Dirección:
            <input
              type="text"
              name="address"
              value={tourData.address}
              onChange={handleChange}
            />
          </label>
          <label>
            Duración:
            <input
              type="text"
              name="duration"
              value={tourData.duration}
              onChange={handleChange}
            />
          </label>
          <label>
            Descripción:
            <textarea
              name="desc"
              value={tourData.desc}
              onChange={handleChange}
            />
          </label>
        </div>
        <div className="form-column">
          <label>
            Precio:
            <input
              type="number"
              name="price"
              value={tourData.price}
              onChange={handleChange}
            />
          </label>
          <label>
            Máximo tamaño del grupo:
            <input
              type="number"
              name="maxGroupSize"
              value={tourData.maxGroupSize}
              onChange={handleChange}
            />
          </label>
          <label>
            ¿Destacado?
            <input
              type="checkbox"
              name="featured"
              checked={tourData.featured}
              onChange={() =>
                setTourData({ ...tourData, featured: !tourData.featured })
              }
            />
          </label>
          <label>
            Fotos:
            <input
              type="file"
              name="photos"
              multiple
              onChange={handleFileChange}
            />
          </label>
          <div className="image-previews">
            {imagePreviews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`Imagen ${index}`}
                width="20"
                height="20"
              />
            ))}
          </div>
        </div>

        <div className="btn-form">
          <input type="submit" value="Crear tour" />
          <button onClick={handleBack} className="back">
            Regresar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTour;
