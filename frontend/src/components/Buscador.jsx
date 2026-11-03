import { useEffect, useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import {estaLogueado, getUsuario, buscarUsuarios } from "../api/auth"
import "./Buscador.css"

const API_URL = "http://localhost:3000";

function Buscar(){

    const location = useLocation()
    const user = getUsuario()
    const logueado = estaLogueado()
    const navigate = useNavigate()
    const [busqueda, setBusqueda] = useState("")
    const [usuariosEncontrados, setUsuariosEncontrados] = useState([])
    const [error, setError] = useState("")

    useEffect(()=>{
        if(!estaLogueado()){
            navigate("/login");
            return
        }
    }, [navigate])

    const manejarCambioInput = async (e) =>{
        const texto = e.target.value;
        setBusqueda(texto);
        setError("");
        
        if (texto.trim() === ""){
            setUsuariosEncontrados([]);
            return;
        }
        
        try {
            const resultados = await buscarUsuarios(texto);
            setUsuariosEncontrados(resultados);
        } catch (err) {
            setError("No se pudo realizar la busqueda");
            console.error(err);
        }
    };

    return(
        <div className="buscador-container">
            <h2>Buscador</h2>
            
            {/* Contenedor redondeado para la barra de búsqueda */}
            <div className="search-bar">
                <img src="/logoLupa.png" alt="Lupa" className="search-icon" />
                <input
                    type="text"
                    placeholder="Busca a un usuario..."
                    value={busqueda}
                    onChange={manejarCambioInput}
                    className="search-input"
                />
            </div>

            {error && <p className="error-msg">{error}</p>}
            
            <div className="resultados-lista">
                {usuariosEncontrados.map((u) => (
                    <div key={u.id} className="usuario-card">
                        <img
                            src={u.profilePicture ? `${API_URL}/${u.profilePicture}` : "/defaultProfile.png"}
                            alt={u.username}
                            className="usuario-avatar"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/defaultProfile.png";
                            }}
                        />
                        <Link to={`/profile/${u.id}`} className="usuario-link">
                            <span>{u.username}</span>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Buscar;