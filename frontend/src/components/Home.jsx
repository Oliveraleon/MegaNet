import { useEffect, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { cerrarSesion, getUsuario, estaLogueado } from "../api/auth"
import FollowButton from "./FollowButton"
import "./Home.css"


function Home() {
    const navigate = useNavigate()
    const user = getUsuario()
    const logueado = estaLogueado()

    const [tipo, setTipo] = useState("invitado")
    const [posts, setPosts] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [seguidos, setSeguidos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState("")

    const cargar = async () => {
        try {
            setError("")
            const token = localStorage.getItem("token")
            const config = { headers: { Authorization: "Bearer " + token } }

            const res = await axios.get("http://localhost:3000/users/feed", logueado ? config : {})

            if (logueado && res.data.tipo === "invitado") {
                cerrarSesion()
                navigate("/login")
                return
            }

            setTipo(res.data.tipo)
            setPosts(res.data.posts)

            if (res.data.tipo === "registrado") {
                const res2 = await axios.get("http://localhost:3000/users/usuarios", config)
                setUsuarios(res2.data.usuarios)
                setSeguidos(res2.data.seguidos)
            }
        } catch (error) {
            console.log(error)
            setError("No se pudo cargar el feed: " + (error.response?.data?.error || error.response?.data?.message || error.message))
        }
    }

    useEffect(() => {
        cargar()
    }, [])


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
                        <h2 className="home-title">Hola, {user?.username}</h2>
                    )}

                    {error && <p className="home-error">{error}</p>}

                    {!error && posts.length === 0 && (
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
                                    <div className="avatar">{post.autor.username[0].toUpperCase()}</div>
                                    <strong>@{post.autor.username}</strong>
                                </div>

                                {post.autor && post.autor.id !== user?.id && (
                                    <FollowButton
                                        userId={post.autor.id}
                                        username={post.autor.username}
                                        siguiendoInicial={tipo === "registrado"}
                                        onChange={cargar}
                                    />
                                )}
                            </header>

                            <p className="post-content">{post.content}</p>
                        </article>
                    ))}
                </main>

                {tipo === "registrado" && (
                    <aside className="home-side">
                        <h3>Personas en MegaNet</h3>
                        {usuarios.map((u) => (
                            <div className="user-row" key={u.id}>
                                <div className="post-author">
                                    <div className="avatar">{u.username[0].toUpperCase()}</div>
                                    <strong>@{u.username}</strong>
                                </div>
                                <FollowButton
                                    userId={u.id}
                                    username={u.username}
                                    siguiendoInicial={seguidos.includes(u.id)}
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