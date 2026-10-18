import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { iniciarSesion } from "../api/auth"
import axios from "axios"
import "./Login.css"
import "./Register.css"

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()


    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        try {
            const res = await axios.post("http://localhost:3000/users/login", {
                email,
                password,
            })
            localStorage.setItem("token", res.data.token)
            localStorage.setItem("user", JSON.stringify(res.data.user))
            navigate("/home")
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Iniciar sesión</h2>
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

                    {error && <p className="warning-text">{error}</p>}

                    <button type="submit" className="btn-submit">Iniciar sesión</button>
                </form>

                <div className="login-footer">
                    <p>¿No tenés cuenta? <Link to="/register">Registrate</Link></p>
                </div>
            </div>
        </div>
    )
}

export default Login