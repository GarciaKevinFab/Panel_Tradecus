import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/config";
import { toast } from "react-toastify";

const IdentityField = ({ index, dni, setDni, userData, setUserData, documentTypes, setDocumentTypes }) => {
    const [isValid, setIsValid] = useState(false);

    const handleTypeChange = (e) => {
        const updatedTypes = [...documentTypes];
        updatedTypes[index] = e.target.value;
        setDocumentTypes(updatedTypes);
        setIsValid(false);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        const updatedDni = [...dni];
        updatedDni[index] = value;
        setDni(updatedDni);
        setIsValid(false);
    };

    const handleBlur = async () => {
        const value = dni[index];
        const type = documentTypes[index];

        if (type === "dni" && value.length === 8) {
            try {
                const response = await axios.get(`${BASE_URL}/dni/getDniData/${value}`);
                if (response.data?.nombres) {
                    const updatedUserData = [...userData];
                    updatedUserData[index] = response.data;
                    setUserData(updatedUserData);
                    setIsValid(true);
                    toast.success(`DNI ${value} validado correctamente.`);
                }
            } catch {
                toast.error("Error al validar DNI.");
            }
        }

        if (type === "carnet" && value.length === 9) {
            try {
                const response = await axios.get(`${BASE_URL}/cee/getCeeData/${value}`);
                if (response.data?.success && response.data?.data) {
                    const updatedUserData = [...userData];
                    updatedUserData[index] = {
                        nombres: response.data.data.nombres,
                        apellidoPaterno: response.data.data.apellido_paterno,
                        apellidoMaterno: response.data.data.apellido_materno
                    };
                    setUserData(updatedUserData);
                    setIsValid(true);
                    toast.success(`Carnet ${value} validado correctamente.`);
                }
            } catch {
                toast.error("Error al validar Carnet.");
            }
        }
    };

    return (
        <div style={{ marginBottom: "1rem" }}>
            <select value={documentTypes[index]} onChange={handleTypeChange}>
                <option value="dni">DNI</option>
                <option value="carnet">Carnet de Extranjería</option>
            </select>
            <input
                type="text"
                maxLength={documentTypes[index] === "dni" ? 8 : 9}
                value={dni[index]}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={documentTypes[index] === "dni" ? "DNI Persona" : "Carnet Persona"}
            />
            {isValid && <span style={{ color: "green", marginLeft: "0.5rem" }}>✔️ Validado</span>}
        </div>
    );
};

export default IdentityField;
