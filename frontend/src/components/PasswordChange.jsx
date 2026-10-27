import { useState} from "react";
import { actualizarContraseña } from "../api/auth";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function EditPassword() {
    const [formData, setFormData] = useState({
        contraseñaActual: "",
        nuevaContraseña: "",
        confirmarContraseña: ""
        
    })
    const navigate = useNavigate()

    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) =>{
        e.preventDefault();
        if(!formData.contraseñaActual.trim()){
            alert("Hace falta ingresar la contraseña actual")
            return
        }
        if(!formData.nuevaContraseña.trim()){
            alert("Hace falta ingresar la nueva contraseña")
            return
        }
        if(!formData.confirmarContraseña.trim()){
            alert("Falta confirmar la nueva contraseña")
            return
        }
        if(formData.nuevaContraseña !== formData.confirmarContraseña){
            alert("Las nuevas contraseñas no coinciden")
            return
        }
        try{
            await actualizarContraseña(formData.contraseñaActual, formData.nuevaContraseña);
            alert("Contraseña actualizada con exito")
            navigate("/profile")
        }catch(error){
            console.error("Error al actualizar:", error);
            alert("No se pudo actualizar la contraseña");
        }
    };


    return(
        <div className="main-container" style={{maxWidth: "500px", margin: "40px auto", padding: "20px"}}>
            <h2>Cambiar contraseña</h2>
            <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px"}}>
                <label>
                    Contraseña actual:
                    <input
                        type="password"
                        name="contraseñaActual"
                        value={formData.contraseñaActual}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </label>
                <label>
                    Nueva contraseña:
                    <input
                        type="password"
                        name="nuevaContraseña"
                        value={formData.nuevaContraseña}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </label>
                <label>
                    Confirmar nueva contraseña:
                    <input
                        type="password"
                        name="confirmarContraseña"
                        value={formData.confirmarContraseña}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </label>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button
                        type="submit"
                        className="edit-profile-btn" 
                        style={{ background: "#4CAF50", color: "white" }}>
                        Guardar nueva contraseña
                    </button>
                    <button
                        type="button"
                        onClick={()=>navigate("/profileEdit")} className="edit-profile-btn">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditPassword