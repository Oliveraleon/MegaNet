import { useEffect, useState } from "react"
import axios from "axios"
import { Link, useNavigate, Navigate } from "react-router-dom"
import { cerrarSesion, getUsuario, estaLogueado, darLike, quitarLike, esAdmin } from "../api/auth"
import FollowButton from "./FollowButton"
import "./Home.css"

const API_URL = "http://localhost:3000"

function Home() {
    const navigate = useNavigate()
    const user = getUsuario()
    const logueado = estaLogueado()

    const [tipo, setTipo] = useState("invitado")
    const [publicaciones, setPublicaciones] = useState([])
    const [cargando, setCargando] = useState(true)
    const [mensaje, setMensaje] = useState("")
    const [error, setError] = useState("")

    const [cambioLike, setCambioLike] = useState({})
    const [menuPostAbiertoId, setMenuPostAbiertoId] = useState(null)
    const [postAEliminar, setPostAEliminar] = useState(null)

    const cargar = async () => {
        try {
            setError("")
            const token = localStorage.getItem("token")
            const config = { headers: { Authorization: "Bearer " + token } }

            const res = await axios.get(`${API_URL}/user/feed`, logueado ? config : {})

            if (logueado && res.data.tipo === "invitado") {
                cerrarSesion()
                navigate("/login")
                return
            }

            const postData = res.data.posts || []
            setTipo(res.data.tipo)
            setPublicaciones(postData)
            const estadoLikes = {}
            postData.forEach(p => {
                const postId = p.id || p.id_publicacion
                estadoLikes[postId] = p.liked
            })
            setCambioLike(estadoLikes)

        } catch (err) {
            console.log(err)
            setError("No se pudo cargar el feed: " + (err.response?.data?.error || err.response?.data?.message || err.message))
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        if (estaLogueado()) {
            cargar()
        } else {
            setCargando(false)
        }
    }, [])

    const iniciarEliminacionPost = (postId) => {
        setPostAEliminar(postId)
        setMenuPostAbiertoId(null)
    }

    const ejecutarEliminacionPost = async () => {
        if (!postAEliminar) return

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/publicaciones/${postAEliminar}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Error al eliminar la publicación")

            setPublicaciones(publicaciones.filter(p => (p.id || p.id_publicacion) !== postAEliminar))
            setMensaje("Publicación eliminada correctamente.")
        } catch (error) {
            console.error("Error al eliminar el post:", error)
            setError("Error al eliminar la publicación")
        } finally {
            setPostAEliminar(null)
        }
    }

    return (
        <div className="home" style={{ position: "relative" }}>
            <main className="home-contenido" style={{ width: "100%", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
                {tipo === "invitado" && (
                    <div className="home-banner">
                        Estás viendo MegaNet como invitado.{" "}
                        <Link to="/login">Iniciá sesión</Link> o{" "}
                        <Link to="/register">registrate</Link> para ver las publicaciones de
                        las personas que seguís.
                    </div>
                )}
                {error && <p className="error" role="alert">{error}</p>}
                {mensaje && <p className="mensaje" role="status">{mensaje}</p>}

                <section className="feed">
                    <h2>Publicaciones</h2>

                    {cargando ? (
                        <p>Cargando publicaciones...</p>
                    ) : publicaciones.length === 0 ? (
                        <p className="home-empty">
                            {tipo === "registrado"
                                ? "Tu feed está vacío. Seguí a alguien para ver sus publicaciones."
                                : "Todavía no hay publicaciones."}
                        </p>
                    ) : (
                        publicaciones.map((post) => {
                            const postId = post.id || post.id_publicacion

                            const autor = post.autor || {}
                            const autorId = post.userId || autor.id
                            const esMiPost = user && Number(autorId) === Number(user?.id);
                            const puedeBorrar = esMiPost || esAdmin();
                            return (
                                <div key={postId} className="post-card" style={{ background: "#fff", padding: "16px", borderRadius: "12px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                                    <div className="post-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Link to={`/profile/${autorId}`} className="post-header-link" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
                                            <img
                                                src={autor.profilePicture ? `${API_URL}/${autor.profilePicture}` : "/defaultProfile.png"}
                                                alt="Foto de perfil"
                                                className="post-avatar"
                                                style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                                                onError={(e)=>{
                                                    e.currentTarget.onerror = null
                                                    e.currentTarget.src = "/defaultProfile.png"
                                                }}
                                            />
                                            <div className="post-user-info" style={{ display: "flex", flexDirection: "column" }}>
                                                <span className="post-username" style={{ fontWeight: "600", color: "#333" }}>{autor.username || "Usuario"}</span>
                                                <span className="post-date" style={{ fontSize: "12px", color: "#777" }}>
                                                    {post.creationDate ? new Date(post.creationDate).toLocaleDateString() : ""}
                                                </span>
                                            </div>
                                        </Link>
                                        {puedeBorrar && (
                                            <div style={{ position: "relative" }}>
                                                <button 
                                                    onClick={() => setMenuPostAbiertoId(menuPostAbiertoId === postId ? null : postId)}
                                                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px" }}
                                                >
                                                    <img 
                                                        src="/logoPuntos.png" 
                                                        alt="Opciones" 
                                                        style={{ width: "20px", height: "20px", objectFit: "contain" }} 
                                                    />
                                                </button>

                                                {menuPostAbiertoId === postId && (
                                                    <div style={{
                                                        position: "absolute",
                                                        right: 0,
                                                        top: "25px",
                                                        background: "white",
                                                        border: "1px solid #ddd",
                                                        borderRadius: "6px",
                                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                        zIndex: 10,
                                                        width: "130px"
                                                    }}>
                                                        <button 
                                                            onClick={() => iniciarEliminacionPost(postId)}
                                                            style={{
                                                                width: "100%",
                                                                padding: "8px 12px",
                                                                background: "transparent",
                                                                border: "none",
                                                                textAlign: "left",
                                                                color: "#ff3b30",
                                                                cursor: "pointer",
                                                                fontSize: "13px",
                                                                fontWeight: "600"
                                                            }}
                                                        >
                                                            Eliminar post
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {post.content && <p className="post-text" style={{ marginTop: "12px", color: "#444" }}>{post.content}</p>}
                                    
                                    {post.multimedia && (
                                        <div className="post-media-container">
                                        {post.multimedia.endsWith(".mp4") || post.multimedia.endsWith(".mov") ? (
                                            <video controls src={`${API_URL}/${post.multimedia}`} className="post-media" />
                                        ) : (
                                            <img src={`${API_URL}/${post.multimedia}`} alt="Multimedia" className="post-media" />
                                        )}
                                    </div>
                                )}

                                    <div className="post-actions" style={{ display: "flex", gap: "20px", marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                                        <button className="action-btn"
                                            type="button" 
                                            onClick={async () => {
                                                const yaDioLike = cambioLike[postId]

                                                try {
                                                    let data
                                                    if (yaDioLike) {
                                                        data = await quitarLike(postId)
                                                    } else {
                                                        data = await darLike(postId)
                                                    }

                                                    setCambioLike({ ...cambioLike, [postId]: !yaDioLike })

                                                    setPublicaciones(publicaciones.map(p => {
                                                        const idActual = p.id || p.id_publicacion
                                                        if (idActual === postId) {
                                                            return {
                                                                ...p,
                                                                likes: data.likes
                                                            }
                                                        }
                                                        return p
                                                    }))
                                                } catch (error) {
                                                    console.error("Error al actualizar el like:", error)
                                                }
                                            }}
                                            style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", cursor: "pointer" }} 
                                        >
                                            <img
                                                src={cambioLike[postId] ? "/logoCorazonLleno.png" : "/logoCorazonVacio.png"}
                                                alt="Me gusta"
                                                style={{ width: "20px", height: "20px", objectFit: "contain" }}
                                            />
                                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>
                                                {post.likes || 0}
                                            </span>
                                        </button>
                                        
                                        <button 
                                            className="action-btn"
                                            onClick={() => navigate(`/comentarios/${postId}`)} 
                                            style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", cursor: "pointer" }}
                                        >
                                            <img
                                                src="/logoComentario.png"
                                                alt="Comentar"
                                                style={{ width: "20px", height: "20px", objectFit: "contain" }}
                                            />
                                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>
                                                {post.cantidadComentarios || 0}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </section>
            </main>
            {postAEliminar && (
                <div style={{
                    position: "fixed",
                    top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        background: "white", padding: "20px 24px", borderRadius: "12px",
                        width: "320px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                    }}>
                        <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>¿Eliminar publicación?</h3>
                        <p style={{ margin: "0 0 20px 0", color: "#666", fontSize: "14px" }}>
                            Esta acción no se puede deshacer y borrará también sus comentarios y likes.
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            <button 
                                onClick={() => setPostAEliminar(null)}
                                style={{
                                    padding: "8px 16px", background: "#f0f2f5", border: "none",
                                    borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#333"
                                }}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={ejecutarEliminacionPost}
                                style={{
                                    padding: "8px 16px", background: "#ff3b30", border: "none",
                                    borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "white"
                                }}
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home