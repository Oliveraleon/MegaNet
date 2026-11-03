import "./Chat.css"

import { Link, useLocation } from "react-router-dom"

const secciones = [
    ["/home", "📰 Publicaciones"],
    ["/chat", "💬 Chats"],
    ["/servidores", "🖥️ Servidores"],
]

// Menú de arriba para pasar entre Publicaciones, Chats y Servidores
function Secciones() {
    const ruta = useLocation().pathname

    return (
        <div className="secciones">
            {secciones.map(([destino, nombre]) => (
                <Link key={destino} to={destino} className={ruta.startsWith(destino) ? "seccion-boton activo" : "seccion-boton"}>
                    {nombre}
                </Link>
            ))}
        </div>
    )
}

export default Secciones