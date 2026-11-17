import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { estaLogueado } from "../api/auth"

function FollowButton({ userId, username, estadoInicial = "ninguno", onChange }) {
    console.log("Estado inicial recibido:", estadoInicial);
    const [estado, setEstado] = useState(estadoInicial)
    const [paso, setPaso] = useState("")
    const useNavigateInstance = useNavigate() // o navigate

    useEffect(() => {
        setEstado(estadoInicial)
    }, [estadoInicial])

    const seguir = async () => {
        if (!estaLogueado()) {
            useNavigateInstance("/login")
            return
        }
        try {
            const token = localStorage.getItem("token")
            const res = await axios.post("http://localhost:3000/user/seguir/" + userId, {}, {
                headers: { Authorization: "Bearer " + token }
            })
            
            // El backend nos devuelve el estado con el que quedó ("aceptado" o "pendiente")
            const nuevoEstado = res.data.estado || "aceptado"
            setEstado(nuevoEstado)
            
            if (onChange) onChange()
        } catch (error) {
            alert("No se pudo seguir al usuario")
        } 
    }

    const dejarDeSeguir = async () => {
        try {
            const token = localStorage.getItem("token")
            await axios.delete("http://localhost:3000/user/seguir/" + userId, {
                headers: { Authorization: "Bearer " + token }
            })
            setEstado("ninguno")
            setPaso("")
            if (onChange) onChange()
        } catch (error) {
            alert("No se pudo dejar de seguir / cancelar solicitud")
        }
    }

    return (
        <>
            {/* Renderizado condicional según el estado de la relación */}
            {estado === "aceptado" && (
                <button className="follow-btn following" onClick={() => setPaso("menu")}>
                    Siguiendo ▾
                </button>
            )}

            {estado === "pendiente" && (
                <button className="follow-btn pending" onClick={() => setPaso("confirmar")}>
                    Solicitud enviada
                </button>
            )}

            {(estado === "ninguno" || estado === "ninguna") && (
                <button className="follow-btn" onClick={seguir}>
                    Seguir
                </button>
            )}

            {(paso === "menu" || paso === "confirmar") && (
                <div className="modal-overlay" onClick={() => setPaso("")}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        {paso === "menu" && (
                            <>
                                <div className="modal-header">
                                    <strong>@{username}</strong>
                                    <button className="modal-close" onClick={() => setPaso("")}>✕</button>
                                </div>
                                <button className="modal-option" disabled>Agregar a lista de mejores amigos</button>
                                <button className="modal-option" disabled>Agregar a favoritos</button>
                                <button className="modal-option" disabled>Silenciar</button>
                                <button className="modal-option" disabled>Restringir</button>
                                <button className="modal-option danger" onClick={() => setPaso("confirmar")}>
                                    Dejar de seguir
                                </button>
                            </>
                        )}

                        {paso === "confirmar" && (
                            <div className="modal-confirm">
                                <h3>
                                    {estado === "pendiente" 
                                        ? `¿Cancelar solicitud a @${username}?` 
                                        : `¿Dejar de seguir a @${username}?`
                                    }
                                </h3>
                                <p>
                                    {estado === "pendiente"
                                        ? "Se cancelará la solicitud de seguimiento enviada a este usuario."
                                        : "Dejarás de ver sus publicaciones en tu inicio. Si cambiás de opinión, vas a tener que volver a seguirlo."
                                    }
                                </p>
                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setPaso("")}>Cancelar</button>
                                    <button className="btn-danger" onClick={dejarDeSeguir}>
                                        {estado === "pendiente" ? "Cancelar solicitud" : "Dejar de seguir"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default FollowButton