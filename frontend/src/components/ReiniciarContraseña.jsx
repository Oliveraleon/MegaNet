import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { reiniciarContraseña } from "../api/auth";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [nuevaPassword, setNuevaPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!nuevaPassword || !confirmarPassword) {
            setError("Por favor completa todos los campos");
            return;
        }

        if (nuevaPassword !== confirmarPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (!token) {
            setError("Token de recuperación no válido o faltante");
            return;
        }

        try {
            setCargando(true);
            const data = await reiniciarContraseña(token, nuevaPassword);
            setMensaje(data.message || "¡Contraseña restablecida con éxito!");
            setTimeout(() => {
                navigate("/login");
            }, 2500);
        } catch (err) {
            setError(err.message || "El enlace es inválido o ha expirado");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="main-container" style={{ maxWidth: "400px", margin: "40px auto", padding: "20px" }}>
            <h2>Restablecer Contraseña</h2>
            <p style={{ fontSize: "14px", color: "#666" }}>
                Ingresa tu nueva contraseña para continuar.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                <label>
                    Nueva contraseña:
                    <input 
                        type="password" 
                        value={nuevaPassword} 
                        onChange={(e) => setNuevaPassword(e.target.value)} 
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </label>

                <label>
                    Confirmar nueva contraseña:
                    <input 
                        type="password" 
                        value={confirmarPassword} 
                        onChange={(e) => setConfirmarPassword(e.target.value)} 
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </label>

                <button 
                    type="submit" 
                    disabled={cargando}
                    style={{ background: "#4CAF50", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
                >
                    {cargando ? "Guardando..." : "Guardar nueva contraseña"}
                </button>
            </form>

            {mensaje && <p style={{ color: "green", marginTop: "15px" }}>{mensaje}</p>}
            {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}

            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <Link to="/login">Ir al inicio de sesión</Link>
            </div>
        </div>
    );
}

export default ResetPassword;