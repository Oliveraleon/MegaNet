import { useState, useEffect, useRef } from "react";
import { obtenerPerfil, actualizarPerfil } from "../api/auth";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function EditProfile() {
    const [formData, setFormData] = useState({
        username: "",
        description: "",
        profilePicture: "",
        profileBanner: ""
    });
    const navigate = useNavigate();

    const fileInputProfileRef = useRef(null)
    const fileInputBannerRef = useRef(null)

    useEffect(() => {
        async function cargarDatos() {
            try {
                const data = await obtenerPerfil();
                const usuario = data.user || data; 
                setFormData({
                    username: usuario.username || "",
                    description: usuario.description || "",
                    profilePicture: usuario.profilePicture || "",
                    profileBanner: usuario.profileBanner || ""
                });
            } catch (error) {
                console.error("No se pudo cargar el perfil para editar", error);
            }
        }
        cargarDatos();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) =>{
        const file = e.target.files[0];
        const fieldName = e.target.name;

        if(file){
            if(!file.type.startsWith("image/")){
                alert("Selecciona un archivo de imagen valido");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prevData)=> ({
                    ...prevData,
                    [fieldName]:reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.username.trim()){
            alert("El nombre de usuario no puede estar vacío")
            return;
        }
        if(formData.description > 250){
            alert("La biografia no puede superar los 250 caracteres")
            return;
        }
        try {
            await actualizarPerfil(formData);
            alert("¡Perfil actualizado con éxito!");
            navigate("/profile"); 
        } catch (error) {
            console.error("Error al actualizar:", error);
            alert("No se pudo actualizar el perfil");
        }
    };

    return (
        <div className="main-container" style={{ margin: "40px auto", padding: "20px" }}>
            <h2>Editar Perfil</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                <label>
                    Nombre de usuario:
                    <input 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </label>
                <label>
                    Biografía / Descripción:
                    <textarea 
                        name="description" 
                        value={formData.description}
                        maxLength={250} 
                        onChange={handleChange} 
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                    <span style={{fontSize: "12px", color: "#666", display: "block", textAlign: "right"}}>
                        {formData.description.length} / 250
                    </span>
                </label>
                <label>
                    Foto de perfil:
                    <input 
                        type="file" 
                        name="profilePicture" 
                        accept="image/*" 
                        ref={fileInputProfileRef}
                        onChange={handleFileChange} 
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </label>
                <label>
                    Banner:
                    <input 
                        type="file" 
                        name="profileBanner" 
                        accept="image/*" 
                        ref={fileInputBannerRef}
                        onChange={handleFileChange} 
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </label>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button type="submit" className="edit-profile-btn" style={{ background: "#4CAF50", color: "white" }}>
                        Guardar cambios
                    </button>
                    <button type="button" onClick={() => navigate("/profile")} className="edit-profile-btn">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditProfile;