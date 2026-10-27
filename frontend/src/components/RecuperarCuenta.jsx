import { useState } from "react";
import { recuperarCuenta } from "../api/auth";
import { Link } from "react-router-dom";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!email.trim()) {
            setError("Por favor ingresa tu correo electrónico");
            return;
        }

        try {
            setCargando(true);
            const data = await recuperarCuenta(email);
            setMensaje(data.message || "¡Correo enviado con éxito! Revisa tu bandeja de entrada.");
        } catch (err) {
            setError(err.message || "No se pudo enviar el correo");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="main-container" style={{ maxWidth: "400px", margin: "40px auto", padding: "20px" }}>
            <h2>Recuperar Contraseña</h2>
            <p style={{ fontSize: "14px", color: "#666" }}>
                Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                <label>
                    Correo electrónico:
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="tu_correo@gmail.com"
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </label>

                <button 
                    type="submit" 
                    disabled={cargando}
                    style={{ background: "#4CAF50", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
                >
                    {cargando ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
            </form>

            {mensaje && <p style={{ color: "green", marginTop: "15px" }}>{mensaje}</p>}
            {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}

            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <Link to="/login">Volver al inicio de sesión</Link>
            </div>
        </div>
    );
}

export default ForgotPassword;