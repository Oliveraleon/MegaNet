import "./Home.css"

import { useEffect, useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import { estaLogueado, getUsuario } from "../api/auth"
import axios from "axios"
import FollowButton from "./FollowButton"

function PerfilUsuario() {
    const { id } = useParams()
    const [datos, setDatos] = useState(null)
    const [error, setError] = useState("")

    const token = localStorage.getItem("token")
    const config = { headers: { Authorization: "Bearer " + token } }

    const cargar = async () => {
        try {
            setError("")
            const res = await axios.get("http://localhost:3000/user/perfil/" + id, config)
            setDatos(res.data)
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo cargar el perfil")
        }
    }

    useEffect(() => {
        if (estaLogueado()) {
            cargar()
        }
    }, [id])

    // Enviar solicitud de amistad
    const enviarSolicitud = async () => {
        try {
            await axios.post("http://localhost:3000/user/amistad/" + id, {}, config)
            cargar()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo enviar la solicitud")
        }
    }

    // Aceptar la solicitud que me enviaron
    const aceptarSolicitud = async () => {
        try {
            await axios.post("http://localhost:3000/user/amistad/" + id + "/aceptar", {}, config)
            cargar()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo aceptar la solicitud")
        }
    }

    // Cancelar la solicitud que envie, rechazar la que recibi o eliminar a un amigo
    const eliminarAmistad = async () => {
        if (datos.amistad === "amigos" && !confirm("¿Querés eliminar a @" + datos.usuario.username + " de tus amigos?")) {
            return
        }
        try {
            await axios.delete("http://localhost:3000/user/amistad/" + id, config)
            cargar()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo completar la accion")
        }
    }

    if (!estaLogueado()) return <Navigate to="/login" replace />
    if (getUsuario()?.id === Number(id)) return <Navigate to="/profile" replace />

    return (
        <div className="home-container">
            <div className="conexiones-box">
                {error && <p className="home-error">{error}</p>}

                {datos && (
                    <>
                        <div className="perfil-top">
                            <div className="avatar avatar-grande">
                                {datos.usuario.profilePicture
                                    ? <img src={datos.usuario.profilePicture} alt="Foto de perfil" />
                                    : datos.usuario.username[0].toUpperCase()}
                            </div>
                            <div>
                                <h2>@{datos.usuario.username}</h2>
                                {datos.amistad === "amigos" && <span className="etiqueta amigos">Amigos</span>}
                                {datos.meSigue && <span className="etiqueta">Te sigue</span>}
                                {datos.usuario.description && <p>{datos.usuario.description}</p>}
                                <div className="perfil-stats">
                                    <span><strong>{datos.seguidores}</strong> seguidores</span>
                                    <span><strong>{datos.seguidos}</strong> seguidos</span>
                                </div>
                            </div>
                        </div>

                        <div className="perfil-actions">
                            <FollowButton
                                userId={datos.usuario.id}
                                username={datos.usuario.username}
                                siguiendoInicial={datos.loSigo}
                                onChange={cargar}
                            />

                            {datos.amistad === "ninguna" && (
                                <button className="small-btn" onClick={enviarSolicitud}>Agregar amigo</button>
                            )}
                            {datos.amistad === "enviada" && (
                                <button className="small-btn" onClick={eliminarAmistad}>Cancelar solicitud</button>
                            )}
                            {datos.amistad === "recibida" && (
                                <>
                                    <button className="small-btn" onClick={aceptarSolicitud}>Aceptar solicitud</button>
                                    <button className="small-btn danger" onClick={eliminarAmistad}>Rechazar</button>
                                </>
                            )}
                            {datos.amistad === "amigos" && (
                                <button className="small-btn" onClick={eliminarAmistad}>Amigos ✓</button>
                            )}
                        </div>

                        {datos.publicaciones.length === 0 && (
                            <p className="home-empty">Todavía no hay publicaciones.</p>
                        )}

                        {datos.publicaciones.map((post) => (
                            <article className="post-card" key={post.id}>
                                <p className="post-content">{post.content}</p>
                                {post.multimedia && (
                                    <img src={post.multimedia} alt="publicación" className="post-image" />
                                )}
                                <span className="post-date">
                                    {new Date(post.creationDate).toLocaleDateString()}
                                </span>
                            </article>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

export default PerfilUsuario