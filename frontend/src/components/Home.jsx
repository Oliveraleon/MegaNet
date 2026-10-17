import "./Home.css"

import { Navigate, useNavigate } from "react-router-dom"
import { cerrarSesion, getUsuario, estaLogueado } from "../api/auth"

function Home() {

    const navigate = useNavigate()
    const user = getUsuario()
    
    if (!estaLogueado()) return <Navigate to="/login" replace />

    const salir = () => {
        cerrarSesion()
        navigate("/register")
    }

    return (
        <div style={{ fontFamily: "system-ui, sans-serif" }}>
            <main style={{ textAlign: "center", marginTop: 60 }}>
                <h1>Bienvenido/a, {user?.username || user?.email}</h1>
                <p>Acá va a ir el feed de publicaciones.</p>
            </main>
        </div>
    )
}


export default Home