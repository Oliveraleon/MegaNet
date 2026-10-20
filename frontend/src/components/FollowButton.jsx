import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { estaLogueado } from "../api/auth"

function FollowButton({ userId, username, siguiendoInicial, onChange }) {
    const [siguiendo, setSiguiendo] = useState(siguiendoInicial)
    const [paso, setPaso] = useState("")
    const navigate = useNavigate()


    useEffect(() => {
        setSiguiendo(siguiendoInicial)
    }, [siguiendoInicial])

    const seguir = async () => {
        if (!estaLogueado()) {
            navigate("/login")
            return
        }
        try {
            const token = localStorage.getItem("token")
            await axios.post("http://localhost:3000/user/seguir/" + userId, {}, {
                headers: { Authorization: "Bearer " + token }
            })
            setSiguiendo(true)
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
            setSiguiendo(false)
            setPaso("")
            onChange()
        } catch (error) {
            alert("No se pudo dejar de seguir")
        }
    }

    return (
        <>
            {siguiendo ? (
                <button className="follow-btn following" onClick={() => setPaso("menu")}>
                    Siguiendo ▾
                </button>
            ) : (
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
                                <h3>¿Dejar de seguir a @{username}?</h3>
                                <p>
                                    Dejarás de ver sus publicaciones en tu inicio. Si cambiás de
                                    opinión, vas a tener que volver a seguirlo.
                                </p>
                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setPaso("")}>Cancelar</button>
                                    <button className="btn-danger" onClick={dejarDeSeguir}>Dejar de seguir</button>
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