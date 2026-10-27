import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import axios from "axios"
import "./Login.css"

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const location = useLocation()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        try {
            const res = await axios.post("http://localhost:3000/auth/login", {
                email,
                password,
            })
            localStorage.setItem("token", res.data.token)
            localStorage.setItem("user", JSON.stringify(res.data.user))
            navigate("/home")
        } catch (error) {
            setError(error.response?.data?.message || error.message || "No se pudo conectar con el servidor")
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button type="submit" className="btn-submit">Iniciar sesión</button>
                </form>
                <div className="login-footer">
                    <p>¿No tenés cuenta? <Link to="/register">Registrate</Link></p>
                </div>
                <div style={{ marginTop: "15px", textAlign: "center" }}>
                    <Link to="/RecuperarCuenta" style={{ fontSize: "14px", color: "#007bff", textDecoration: "none" }}>
                    ¿Olvidaste tu contraseña?
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Login