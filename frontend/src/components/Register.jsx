import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registrar } from "../api/auth"
import "./Register.css"

function Register() {
    const [form, setForm] = useState({ username: "", email: "", password: "" })
    const [error, setError] = useState("")
    const [contenido, setContenido] = useState("")
    const [imagen, setImagen] = useState("")
    const navigate = useNavigate()
    const [mostrarPassword, setMostrarPassword] = useState(false)

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        try {
            await registrar(form)
            navigate("/home")
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="register-layout">
            <div className="register-left">
                <div className="brand-content">
                    <h1>MegaNet</h1>
                    <p>Compartí lo que quieras - Comunícate con quien sea</p>
                    <img 
                        src="Register1.jpg" 
                        alt="Comunidad MegaNet" 
                        className="register-image" 
                    />
                </div>
            </div>

            <div className="register-right">
                <div className="register-card">
                    <h2 className="register-title">Crear cuenta</h2>
                    <p className="register-subtitle">Ingresá tus datos para empezar</p>
                    
                    {tipo === "registrado" && (
    <form className="post-form" onSubmit={publicar}>
        <textarea
            placeholder="¿Qué estás pensando?"
            value={contenido}
            maxLength={255}
            onChange={(e) => setContenido(e.target.value)}
        />
        <input
            type="text"
            placeholder="Link de una imagen (opcional)"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
        />
        <button type="submit">Publicar</button>
    </form>
)}
                {error && (
                    <div style={{
                        backgroundColor: "#ffe6e6",
                        color: "#cc0000",
                        padding: "10px",
                        borderRadius: "6px",
                        marginBottom: "15px",
                        fontsize: "14px",
                        textAlign: "center"
                    }}>
                        {error}
                        </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Nombre de usuario</label>
                        <input 
                            type="text" 
                            name="username"
                            placeholder="Nombre de usuario" 
                            value={form.username}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>Correo electrónico</label>
                        <input 
                            type="email" 
                            name="email"
                            placeholder="Correo electrónico" 
                            value={form.email}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="input-group" style={{ position: "relative"}}>
                        <label>Contraseña</label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <input
                                type={mostrarPassword ? "text" : "password"}
                                name="password"
                                placeholder="Contraseña"
                                value={form.password}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", paddingRight: "40px" }}
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarPassword(!mostrarPassword)}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    outline: "none",
                                }}
                                >
                                    {mostrarPassword ? "🚫" : "👁️"}
                                </button>
                        </div>
                    </div>
                        <button type="submit" className="register-button">Registrarse</button>
                    </form>

                    <div className="register-footer">
                        <p>¿Ya tenés una cuenta? <a href="/login">Iniciá sesión</a></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register

const publicar = async (e) => {
    e.preventDefault()
    try {
        setError("")
        const token = localStorage.getItem("token")
        const config = { headers: { Authorization: "Bearer " + token } }
        await axios.post("http://localhost:3000/users/publicaciones", { content: contenido, multimedia: imagen }, config)
        setContenido("")
        setImagen("")
        cargar()
    } catch (err) {
        setError(err.response?.data?.message || "No se pudo publicar")
    }
}