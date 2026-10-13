import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { iniciarSesion } from "../api/auth"
import "./Register.css"

function Login() {
    const [form, setForm] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const location = useLocation()

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        try {
            await iniciarSesion(form)
            navigate("/home")
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>👋 Bienvenido a MegaNet</h2>
                <p className="subtitle">Iniciá sesión para continuar</p>

                {location.state?.registrado && (
                    <p style={{ color: "green" }}>¡Registro exitoso! Ahora iniciá sesión.</p>
                )}

                <form onSubmit={handleSubmit}>
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

                    <div className="input-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Tu contraseña"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button type="submit" className="btn-submit">Entrar</button>
                </form>

                <div className="login-footer">
                    <p>¿No tenés cuenta? <a href="/register">Registrate</a></p>
                </div>
            </div>
        </div>
    )
}

export default Login