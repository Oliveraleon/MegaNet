import { useEffect, useState } from "react"
import axios from "axios"
import { Link, useNavigate, Navigate } from "react-router-dom"
import { cerrarSesion, getUsuario, estaLogueado } from "../api/auth"
import FollowButton from "./FollowButton"
import "./Home.css"

const API_URL = "http://localhost:3000"

function Home() {
    const navigate = useNavigate()
    const user = getUsuario()
    const logueado = estaLogueado()

    const [tipo, setTipo] = useState("invitado")
    const [publicaciones, setPublicaciones] = useState([])
    const [contenido, setContenido] = useState("")
    const [imagen, setImagen] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [mensaje, setMensaje] = useState("")
    const [error, setError] = useState("")

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

            setTipo(res.data.tipo)
            setPublicaciones(res.data.posts || [])
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

    function salir() {
        cerrarSesion()
        navigate("/login")
    }

    if (!estaLogueado()) {
        return <Navigate to="/login" replace />
    }

    async function publicar(e) {
        e.preventDefault()
        setError("")
        setMensaje("")

        if (!contenido.trim() && !imagen) {
            setError("Escribí un texto o seleccioná una imagen.")
            return
        }

        const formulario = new FormData()
        formulario.append("content", contenido)

        if (imagen) {
            formulario.append("imagen", imagen)
        }

        try {
            setEnviando(true)
            const token = localStorage.getItem("token")

            const respuesta = await axios.post(`${API_URL}/publicaciones`, formulario, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            setContenido("")
            setImagen(null)
            e.target.reset()
            setMensaje("¡Publicación creada correctamente!")

            await cargar()
        } catch (err) {
            console.error("Error al publicar:", err)
            setError(err.response?.data?.message || err.message || "Error al crear la publicación")
        } finally {
            setEnviando(false)
        }
    }

    async function eliminarPublicacion(id) {
        const confirmar = window.confirm("¿Querés desactivar esta publicación?")
        if (!confirmar) return

        setError("")
        setMensaje("")

        try {
            const token = localStorage.getItem("token")
            await axios.delete(`${API_URL}/publicaciones/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            setPublicaciones((anteriores) => anteriores.filter((post) => post.id !== id))
            setMensaje("Publicación desactivada correctamente.")
            await cargar()
        } catch (err) {
            console.error("Error al eliminar:", err)
            setError(err.response?.data?.message || "Error al desactivar la publicación")
        }
    }

    return (
        <div className="home">
            <main className="home-contenido" style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
                <h1>
                    {logueado ? `Bienvenido/a, ${user?.username || user?.email || "Usuario"}` : "Bienvenido/a a MegaNet"}
                </h1>

                {tipo === "invitado" && (
                    <div className="home-banner">
                        Estás viendo MegaNet como invitado.{" "}
                        <Link to="/login">Iniciá sesión</Link> o{" "}
                        <Link to="/register">registrate</Link> para ver las publicaciones de
                        las personas que seguís.
                    </div>
                )}

                {logueado && (
                    <section className="crear-publicacion">
                        <h2>¿Qué querés compartir?</h2>

                        <form onSubmit={publicar}>
                            <textarea
                                value={contenido}
                                onChange={(e) => setContenido(e.target.value)}
                                placeholder="Escribí una publicación..."
                                maxLength={255}
                            />

                            <label htmlFor="imagen">Adjuntar imagen</label>
                            <input
                                id="imagen"
                                name="imagen"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImagen(e.target.files?.[0] || null)}
                            />

                            {imagen && <p>Imagen seleccionada: {imagen.name}</p>}

                            <button type="submit" disabled={enviando}>
                                {enviando ? "Publicando..." : "Publicar"}
                            </button>
                        </form>
                    </section>
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
                        publicaciones.map((post) => (
                            <article className="publicacion post-card" key={post.id}>
                                <header className="post-header">
                                    <div className="post-author">
                                        <div className="avatar">
                                            {post.autor?.username ? post.autor.username[0].toUpperCase() : "U"}
                                        </div>
                                        <strong>@{post.autor?.username || post.autor?.email || "Usuario"}</strong>
                                    </div>

                                    {post.autor && user && Number(post.autor.id) !== Number(user?.id) && (
                                        <FollowButton
                                            userId={post.autor.id}
                                            username={post.autor.username}
                                            siguiendoInicial={tipo === "registrado"}
                                            onChange={cargar}
                                        />
                                    )}
                                </header>

                                {post.content?.trim() && (
                                    <p className="post-content">{post.content}</p>
                                )}

                                {post.multimedia && (
                                    <img
                                        className="publicacion-imagen"
                                        src={`${API_URL}/imagenes/${encodeURIComponent(post.multimedia)}`}
                                        alt="Imagen de la publicación"
                                    />
                                )}

                                <small>
                                    {post.creationDate
                                        ? new Date(post.creationDate).toLocaleString("es-AR")
                                        : ""}
                                </small>

                                {user && Number(post.userId) === Number(user?.id) && (
                                    <button
                                        type="button"
                                        className="small-btn danger"
                                        onClick={() => eliminarPublicacion(post.id)}
                                        style={{ marginTop: "10px" }}
                                    >
                                        Eliminar publicación
                                    </button>
                                )}
                            </article>
                        ))
                    )}
                </section>
            </main>
        </div>
    )
}

export default Home