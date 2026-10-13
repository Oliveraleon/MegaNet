import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registrar } from "../api/auth"
import "./Register.css"

function Register() {
    const [form, setForm] = useState({ username: "", email: "", password: "" })
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        try {
            await registrar(form)
            navigate("/login", { state: { registrado: true } })
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>🚀 Unite a MegaNet</h2>
                <p className="subtitle">Crea tu cuenta para empezar a conectar</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Nombre de usuario</label>
                        <input 
                            type="text" 
                            name="username"
                            placeholder="Ej: JuanPerez" 
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
                            placeholder="correo@ejemplo.com" 
                            value={form.email}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            name="password"
                            placeholder="Mínimo 3 caracteres" 
                            value={form.password}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button type="submit" className="btn-submit">Registrarse</button>
                </form>

                <div className="register-footer">
                    <p>¿Ya tenés una cuenta? <a href="/login">Iniciá sesión</a></p>
                </div>
            </div>
        </div>
    )
}

export default Register