import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import FollowButton from "./FollowButton"


function Post({ post, user, tipo, onChange }) {
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const config = { headers: { Authorization: "Bearer " + token } }

    // Like
    const [liked, setLiked] = useState(post.liked)
    const [likes, setLikes] = useState(post.likes)
    const [corazon, setCorazon] = useState(false) // corazon grande del doble click

    // Editar
    const [editando, setEditando] = useState(false)
    const [texto, setTexto] = useState(post.content)

    // Comentarios
    const [verComentarios, setVerComentarios] = useState(false)
    const [comentarios, setComentarios] = useState([])
    const [nuevo, setNuevo] = useState("")

    // Solo el dueño de la publicacion ve los botones de editar y eliminar
    const esMio = post.autor.id === user?.id

        // Relacion con el autor: amigo, luego lo sigo y por ultimo me sigue
    let etiqueta = ""
    if (post.esAmigo) {
        etiqueta = "Amigos"
    } else if (post.loSigo) {
        etiqueta = "Siguiendo"
    } else if (post.meSigue) {
        etiqueta = "Te sigue"
    }

    const necesitaLogin = () => {
        if (!token) {
            navigate("/login")
            return true
        }
        return false
    }

    const darLike = async () => {
        if (necesitaLogin()) return
        await axios.post("http://localhost:3000/users/publicaciones/" + post.id + "/like", {}, config)
        setLiked(true)
        setLikes(likes + 1)
    }

    const quitarLike = async () => {
        if (necesitaLogin()) return
        await axios.delete("http://localhost:3000/users/publicaciones/" + post.id + "/like", config)
        setLiked(false)
        setLikes(likes - 1)
    }

    // Click en el corazon: da o saca el like
    const clickCorazon = () => {
        if (liked) {
            quitarLike()
        } else {
            darLike()
        }
    }

    // Doble click en la imagen: solo da like (nunca lo saca)
    const dobleClick = () => {
        if (!liked) {
            darLike()
        }
        setCorazon(true)
        setTimeout(() => setCorazon(false), 800)
    }

    const eliminar = async () => {
        if (!confirm("¿Querés eliminar esta publicación?")) return
        await axios.delete("http://localhost:3000/users/publicaciones/" + post.id, config)
        onChange()
    }

    const guardarEdicion = async () => {
        await axios.put("http://localhost:3000/users/publicaciones/" + post.id, { content: texto }, config)
        setEditando(false)
        onChange()
    }

    const abrirComentarios = async () => {
        if (necesitaLogin()) return
        if (!verComentarios) {
            const res = await axios.get("http://localhost:3000/users/publicaciones/" + post.id + "/comentarios", config)
            setComentarios(res.data)
        }
        setVerComentarios(!verComentarios)
    }

    const comentar = async (e) => {
        e.preventDefault()
        if (nuevo.trim() === "") return
        await axios.post("http://localhost:3000/users/publicaciones/" + post.id + "/comentarios", { text: nuevo }, config)
        const res = await axios.get("http://localhost:3000/users/publicaciones/" + post.id + "/comentarios", config)
        setComentarios(res.data)
        setNuevo("")
    }

    return (
        <article className="post-card">
            <header className="post-header">
                <div className="post-author">
                    <div className="avatar">{post.autor.username[0].toUpperCase()}</div>
                                        <Link to={"/usuario/" + post.autor.id} className="autor-link">
                        <strong>@{post.autor.username}</strong>
                    </Link>
                    {etiqueta && <span className={post.esAmigo ? "etiqueta amigos" : "etiqueta"}>{etiqueta}</span>}
                </div>

                {esMio ? (
                    <div className="post-actions">
                        <button className="small-btn" onClick={() => setEditando(!editando)}>Editar</button>
                        <button className="small-btn danger" onClick={eliminar}>Eliminar</button>
                    </div>
                ) : (
                    <FollowButton
                        userId={post.autor.id}
                        username={post.autor.username}
                                                siguiendoInicial={post.loSigo}
                        onChange={onChange}
                    />
                )}
            </header>

            {editando ? (
                <div className="edit-box">
                    <textarea value={texto} maxLength={255} onChange={(e) => setTexto(e.target.value)} />
                    <div className="post-actions">
                        <button className="small-btn" onClick={guardarEdicion}>Guardar</button>
                        <button className="small-btn" onClick={() => setEditando(false)}>Cancelar</button>
                    </div>
                </div>
            ) : (
                <p className="post-content">{post.content}</p>
            )}

            {post.multimedia && (
                <div className="post-media" onDoubleClick={dobleClick}>
                    <img src={post.multimedia} alt="publicación" />
                    {corazon && <span className="big-heart">♥</span>}
                </div>
            )}

            <div className="post-footer">
                <button className={liked ? "heart liked" : "heart"} onClick={clickCorazon}>
                    {liked ? "♥" : "♡"}
                </button>
                <span>{likes}</span>

                <button className="small-btn" onClick={abrirComentarios}>
                    Comentarios ({post.cantidadComentarios})
                </button>
            </div>

            {verComentarios && (
                <div className="comments">
                    {comentarios.length === 0 && <p className="home-empty">Todavía no hay comentarios.</p>}

                    {comentarios.map((c) => (
                        <p key={c.id}>
                            <strong>@{c.autor.username}</strong> {c.text}
                        </p>
                    ))}

                    <form className="comment-form" onSubmit={comentar}>
                        <input
                            type="text"
                            placeholder="Escribí un comentario..."
                            value={nuevo}
                            maxLength={255}
                            onChange={(e) => setNuevo(e.target.value)}
                        />
                        <button className="small-btn" type="submit">Enviar</button>
                    </form>
                </div>
            )}
        </article>
    )
}

export default Post