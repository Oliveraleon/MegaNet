import { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import { obtenerPerfil, actualizarPerfil, eliminarCuenta} from "../api/auth";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const API_URL = "http://localhost:3000";

function EditProfile() {
    const [formData, setFormData] = useState({
        username: "",
        description: "",
        privacidad: "publico"
    });
    const navigate = useNavigate();
    const [mostrarMenuEliminar, setMostrarMenuEliminar] = useState(false);
    const [previewProfile, setPreviewProfile] = useState("");
    const [previewBanner, setPreviewBanner] = useState("");
    const [quitarFotoPerfil, setQuitarFotoPerfil] = useState(false);
    const [quitarBanner, setQuitarBanner] = useState(false);
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
                    privacidad: usuario.privacidad || "publico",
                    profilePicture: usuario.profilePicture || "",
                    profileBanner: usuario.profileBanner || ""
                });
                if (usuario.profilePicture) {
                    setPreviewProfile(`${API_URL}/${usuario.profilePicture}`);
                }
                if (usuario.profileBanner) {
                    setPreviewBanner(`${API_URL}/${usuario.profileBanner}`);
                }
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
        if (!file) return;
        if (file && !file.type.startsWith("image/")){
            alert("Selecciona un archivo de imagen válido");
            e.target.value = "";
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        if (fieldName === "profilePicture"){
            setPreviewProfile(objectUrl);
            
        }else if (fieldName === "profileBanner"){
            setPreviewBanner(objectUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.username.trim()){
            alert("El nombre de usuario no puede estar vacío")
            return;
        }
        if(formData.description.length > 250){
            alert("La biografia no puede superar los 250 caracteres")
            return;
        }
        try {
            const dataForm = new FormData();
            dataForm.append("username", formData.username);
            dataForm.append("description", formData.description);
            dataForm.append("privacidad", formData.privacidad);
            if (quitarFotoPerfil) {
            dataForm.append("removeProfilePicture", "true");
            }
            if (quitarBanner) {
            dataForm.append("removeProfileBanner", "true");
            }
            if(fileInputProfileRef.current && fileInputProfileRef.current.files[0]){
                dataForm.append("profilePicture", fileInputProfileRef.current.files[0]);
            }
            if(fileInputBannerRef.current && fileInputBannerRef.current.files[0]){
                dataForm.append("profileBanner", fileInputBannerRef.current.files[0]);
            }
            const respuesta = await actualizarPerfil(dataForm);
            const usuarioActualizado = respuesta.user || respuesta;
            if(usuarioActualizado){
                localStorage.setItem("user", JSON.stringify(usuarioActualizado));
            }
            alert("¡Perfil actualizado con éxito!");
            navigate("/profile"); 
        } catch (error) {
            console.error("Error al actualizar:", error);
            alert("No se pudo actualizar el perfil");
        }
    };

    const handleEliminarCuenta = async() =>{
        try{
            await eliminarCuenta();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            alert("Tu cuenta ha sido eliminada con exito.");
            navigate("/register")
        }catch(error){
            console.error("Error al eliminar:", error);
            alert(error.message || "No se pudo eliminar la cuenta");
        }
    }

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
                    Privacidad de la cuenta
                    <select
                        name="privacidad"
                        value={formData.privacidad}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    >
                        <option value="public">Pública (Cualquiera puede ver tus posts)</option>
                        <option value="privado">Privada (Requiere aprobación de seguimiento)</option>
                    </select>
                </label>
                <label>
                    Foto de perfil:
                    {previewProfile && (
                        <div style={{ width: "70px", height: "70px", borderRadius: "50%", overflow: "hidden", border: "2px solid #ddd" }}>
                            <img src={previewProfile} alt="Preview Perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                    )}
                    <input 
                        type="file" 
                        name="profilePicture" 
                        accept="image/*" 
                        ref={fileInputProfileRef}
                        onChange={handleFileChange} 
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                    <input
                        type="button"
                        value="Sacar foto de perfil"
                        onClick={() => {
                            setPreviewProfile("");
                            setQuitarFotoPerfil(true);
                            if (fileInputProfileRef.current) fileInputProfileRef.current.value = "";
                        }}
                        style={{ marginTop: "5px", background: "#f44336", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}
                    />  
                </label>
                <label>
                    Banner:
                    {previewBanner && (
                        <div style={{ width: "100%", height: "150px", overflow: "hidden", border: "2px solid #ddd" }}>
                            <img src={previewBanner} alt="Preview Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                    )}
                    <input 
                        type="file" 
                        name="profileBanner" 
                        accept="image/*" 
                        ref={fileInputBannerRef}
                        onChange={handleFileChange} 
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                    <input
                        type="button"
                        value="Sacar banner"
                        onClick={() => {
                            setPreviewBanner("");
                            setQuitarBanner(true);
                            if (fileInputBannerRef.current) fileInputBannerRef.current.value = "";
                        }}
                        style={{ marginTop: "5px", background: "#f44336", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}
                    /> 
                </label>
                <label>
                    <Link to="/passwordChange">Cambiar contraseña</Link>
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
            <div style={{ marginTop: "40px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
                <h3 tyle={{ color: "red" }}>Eliminar cuenta</h3>
                <div style={{ position: "relative", display: "inline-block", marginTop: "10px" }}>
                    <button
                        type="button"
                        onClick={()=> setMostrarMenuEliminar(!mostrarMenuEliminar)}
                        style={{
                            background: "#ff4d4d", 
                            color: "white", 
                            padding: "10px 15px", 
                            border: "none", 
                            borderRadius: "5px", 
                            cursor: "pointer"
                        }}
                    >
                        Eliminar cuenta ▾
                    </button>
                    {mostrarMenuEliminar &&(
                        <div style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            background: "white",
                            border: "1px solid #ccc",
                            boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                            borderRadius: "6px",
                            zIndex: 10,
                            marginTop: "4px",
                            padding: "12px",
                            width: "230px"
                        }}>
                            <p style={{ fontSize: "13px", color: "#333", marginBottom: "8px" }}>
                                ¿Estás seguro? Se borrará todo tu contenido.
                            </p>
                            <button
                                type="button"
                                onClick={handleEliminarCuenta}
                                style={{
                                    background: "#d9534f", 
                                    color: "white", 
                                    border: "none", 
                                    padding: "6px 10px", 
                                    borderRadius: "4px", 
                                    cursor: "pointer",
                                    width: "100%",
                                    fontWeight: "bold"
                                }}
                            >
                                Eliminar cuenta
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EditProfile;