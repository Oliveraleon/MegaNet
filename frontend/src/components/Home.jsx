import "./Home.css"

import { Navigate, useNavigate } from "react-router-dom"
import { cerrarSesion, getUsuario, estaLogueado } from "../api/auth"

function Home() {
}
    const navigate = useNavigate()
    const user = getUsuario()
    
    if (!estaLogueado()) return <Navigate to="/login" replace />

    const salir = () => {
        cerrarSesion()
        navigate("/login")
    }

    return (
        <div style={{ fontFamily: "system-ui, sans-serif" }}>
            <nav style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 24px",
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,.1)"
            }}>
                <strong>MegaNet</strong>
                <button
                    onClick={salir}
                    style={{
                        padding: "8px 14px",
                        border: 0,
                        borderRadius: 8,
                        background: "#007bff",
                        color: "#fff",
                        cursor: "pointer"
                    }}
                >
                    Cerrar sesión
                </button>
            </nav>

            <main style={{ textAlign: "center", marginTop: 60 }}>
                <h1>Bienvenido/a, {user?.username || user?.email}</h1>
                <p>Acá va a ir el feed de publicaciones.</p>
            </main>
        </div>
    )
}

export default Home