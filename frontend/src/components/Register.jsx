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
        <div className="register-layout">
            <div className="register-left">
                <div className="brand-content">
                    <h1>MegaNet</h1>
                    <p>Compartí lo que quieras y comunícate con quien sea</p>
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

                    <div className="input-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            name="password"
                            placeholder="Contraseña" 
                            value={form.password}
                            onChange={handleChange}
                            required 
                        />
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