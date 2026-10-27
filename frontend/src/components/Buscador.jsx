import { useEffect, useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { estaLogueado, getUsuario, buscarUsuarios } from "../api/auth"
import "./Buscador.css"

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
            <input
                type="text"
                placeholder="Busca a un usuario"
                value={busqueda}
                onChange={manejarCambioInput}
            />
            {error && <p className="error-msg">{error}</p>}
            
            <div className="resultados-lista">
                {usuariosEncontrados.map((u) => (
                    <div key={u.id} className="usuario-card">
                        <img
                            src={u.profilePicture || "/defaultProfile.png"}
                            alt={u.username}
                            style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        <Link to={`/profile/${u.id}`}>
                            <span>{u.username}</span>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Buscar;