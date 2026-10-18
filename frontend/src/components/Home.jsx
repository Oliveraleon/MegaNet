import { useEffect, useState } from "react"
import axios from "axios"
import { Navigate, useNavigate } from "react-router-dom"
import { cerrarSesion, getUsuario, estaLogueado } from "../api/auth"
import { getFeed, getUsuarios } from "../api/social"
import "./Home.css"


function Home() {
    const navigate = useNavigate()
    const user = getUsuario()
    const logueado = estaLogueado()

    const [tipo, setTipo] = useState("invitado")
    const [posts, setPosts] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState("")

    const cargar = useCallback(async () => {
        try {
            setError("")
            const data = await getFeed()

            // Tenía token pero el servidor lo tomó como invitado: token vencido
            if (logueado && data.tipo === "invitado") {
                cerrarSesion()
                navigate("/login")
                return
            }

            setTipo(data.tipo)
            setPosts(data.posts)

            if (data.tipo === "registrado") {
                setUsuarios(await getUsuarios())
            }
        } catch (err) {
            setError("No se pudo cargar el feed. Revisá que el backend esté encendido.")
        } finally {
            setCargando(false)
        }
    }, [logueado, navigate])

    useEffect(() => {
        cargar()
    }, [cargar])

    const formatearFecha = (fecha) => (fecha ? new Date(fecha).toLocaleDateString("es-AR") : "")

    return (
        <div className="home-container">
            <div className="home-content">
                <main className="home-feed">
                    {tipo === "invitado" ? (
                        <div className="home-banner">
                            Estás viendo MegaNet como invitado.{" "}
                            <Link to="/login">Iniciá sesión</Link> o{" "}
                            <Link to="/register">registrate</Link> para ver las publicaciones de
                            las personas que seguís.
                        </div>
                    ) : (
                        <h2 className="home-title">Hola, {user?.username || user?.email}</h2>
                    )}

                    {error && <p className="home-error">{error}</p>}
                    {cargando && <p className="home-empty">Cargando publicaciones...</p>}

                    {!cargando && !error && posts.length === 0 && (
                        <p className="home-empty">
                            {tipo === "registrado"
                                ? "Tu feed está vacío. Seguí a alguien para ver sus publicaciones."
                                : "Todavía no hay publicaciones."}
                        </p>
                    )}

                    {posts.map((post) => (
                        <article className="post-card" key={post.id}>
                            <header className="post-header">
                                <div className="post-author">
                                    <div className="avatar">
                                        {post.autor?.profilePicture ? (
                                            <img src={post.autor.profilePicture} alt="" />
                                        ) : (
                                            (post.autor?.username || "?")[0].toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <strong>@{post.autor?.username || "usuario"}</strong>
                                        <span className="post-date">{formatearFecha(post.creationDate)}</span>
                                    </div>
                                </div>

                                {post.autor && post.autor.id !== user?.id && (
                                    <FollowButton
                                        userId={post.autor.id}
                                        username={post.autor.username}
                                        siguiendoInicial={post.siguiendo}
                                        onChange={cargar}
                                    />
                                )}
                            </header>

                            <p className="post-content">{post.content}</p>
                            {post.multimedia && (
                                <img className="post-image" src={post.multimedia} alt="Publicación" />
                            )}
                        </article>
                    ))}
                </main>

                {tipo === "registrado" && (
                    <aside className="home-side">
                        <h3>Personas en MegaNet</h3>
                        {usuarios.length === 0 && <p className="home-empty">No hay otros usuarios todavía.</p>}
                        {usuarios.map((u) => (
                            <div className="user-row" key={u.id}>
                                <div className="post-author">
                                    <div className="avatar">
                                        {u.profilePicture ? <img src={u.profilePicture} alt="" /> : u.username[0].toUpperCase()}
                                    </div>
                                    <strong>@{u.username}</strong>
                                </div>
                                <FollowButton
                                    userId={u.id}
                                    username={u.username}
                                    siguiendoInicial={u.siguiendo}
                                    onChange={cargar}
                                />
                            </div>
                        ))}
                        <Link className="side-link" to="/conexiones">Ver seguidores y seguidos →</Link>
                    </aside>
                )}
            </div>
        </div>
    )
}

export default Home