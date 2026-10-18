import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { seguirUsuario, dejarDeSeguirUsuario } from "../api/social"
import { estaLogueado } from "../api/auth"

function FollowButton({ userId, username, siguiendoInicial = false, onChange }) {
    const [siguiendo, setSiguiendo] = useState(siguiendoInicial)
    const [paso, setPaso] = useState(null)
    const [cargando, setCargando] = useState(false)
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
            setCargando(true)
            await seguirUsuario(userId)
            setSiguiendo(true)
            if (onChange) onChange()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo seguir al usuario")
        } finally {
            setCargando(false)
        }
    }

    const dejarDeSeguir = async () => {
        try {
            setCargando(true)
            await dejarDeSeguirUsuario(userId)
            setSiguiendo(false)
            setPaso(null)
            if (onChange) onChange()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo dejar de seguir")
        } finally {
            setCargando(false)
        }
    }

    return (
        <>
            {siguiendo ? (
                <button className="follow-btn following" onClick={() => setPaso("menu")}>
                    Siguiendo ▾
                </button>
            ) : (
                <button className="follow-btn" onClick={seguir} disabled={cargando}>
                    Seguir
                </button>
            )}

            {paso && (
                <div className="modal-overlay" onClick={() => setPaso(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        {paso === "menu" && (
                            <>
                                <div className="modal-header">
                                    <strong>@{username}</strong>
                                    <button className="modal-close" onClick={() => setPaso(null)}>✕</button>
                                </div>
                                <button className="modal-option" disabled title="Próximamente">
                                    Agregar a lista de mejores amigos
                                </button>
                                <button className="modal-option" disabled title="Próximamente">
                                    Agregar a favoritos
                                </button>
                                <button className="modal-option" disabled title="Próximamente">
                                    Silenciar
                                </button>
                                <button className="modal-option" disabled title="Próximamente">
                                    Restringir
                                </button>
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
                                    <button className="btn-cancel" onClick={() => setPaso(null)}>
                                        Cancelar
                                    </button>
                                    <button className="btn-danger" onClick={dejarDeSeguir} disabled={cargando}>
                                        Dejar de seguir
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