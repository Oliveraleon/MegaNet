import "./Chat.css"

import { Link, useLocation } from "react-router-dom"

// Menú de arriba para pasar entre Publicaciones, Chats y Servidores
function Secciones() {
    const location = useLocation()
    const ruta = location.pathname

    return (
        <div className="secciones">
            <Link to="/home" className={ruta === "/home" ? "seccion-boton activo" : "seccion-boton"}>
                📰 Publicaciones
            </Link>
            <Link to="/chat" className={ruta.startsWith("/chat") ? "seccion-boton activo" : "seccion-boton"}>
                💬 Chats
            </Link>
            <Link to="/servidores" className={ruta.startsWith("/servidores") ? "seccion-boton activo" : "seccion-boton"}>
                🖥️ Servidores
            </Link>
        </div>
    )
}

export default Secciones