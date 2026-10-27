import { Link } from "react-router-dom"
import { getUsuario } from "../api/auth"
import "./Sidebar.css"

function SideBar(){
    const user = getUsuario()
    return(
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <Link to="/home" className="sidebar-item">
                    <span className="sidebar-icon"><img src="/logoCasa.png" alt="logoCasa" style={{ width: "24px", height: "24px", objectFit: "contain" }}/></span>
                    <span className="sidebar-text">Inicio</span>
                </Link>
                <Link to="/buscador" className="sidebar-item">
                    <span className="sidebar-icon"><img src="/logoLupa.png" alt="logoLupa" style={{ width: "24px", height: "24px", objectFit: "contain" }}/></span>
                    <span className="sidebar-text">Buscar</span>
                </Link>
                <Link to="/subirposts" className="sidebar-item">
                    <span className="sidebar-icon"><img src="/logoMas.png" alt="logoMas" style={{ width: "24px", height: "24px", objectFit: "contain" }}/></span>
                    <span className="sidebar-text">Crear</span>
                </Link>
                <Link to="/profile" className="sidebar-item">
                    <img
                        src={user?.profilePicture || "/defaultProfile.png"}
                        alt="Perfil"
                        className="sidebar-avatar"
                        style={{ width: "24px", height: "24px", objectFit: "contain" }}
                    />
                    <span className="sidebar-text">Perfil</span>
                </Link>
            </nav>
        </aside>
    )
}

export default SideBar