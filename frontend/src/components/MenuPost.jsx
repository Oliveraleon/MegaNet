import "./Chat.css"

import { useState } from "react"
import axios from "axios"

// Las 3 privacidades que acepta el backend
const PRIVACIDADES = [
    { valor: "public", icono: "🌎", nombre: "Público", detalle: "Lo ve cualquiera" },
    { valor: "friends", icono: "👥", nombre: "Amigos", detalle: "Solo tus amigos" },
    { valor: "private", icono: "🔒", nombre: "Solo yo", detalle: "Nadie más lo ve" },
]

// Etiqueta chiquita que se muestra al lado de la fecha del post
export function EtiquetaPrivacidad({ privacy }) {
    const p = PRIVACIDADES.find((x) => x.valor === privacy) || PRIVACIDADES[0]
    return <span className={"etiqueta-privacidad " + p.valor} title={p.detalle}>{p.icono} {p.nombre}</span>
}

// Las 3 tarjetas para elegir la privacidad (se usa al crear y al editar)
export function ElegirPrivacidad({ valor, onElegir }) {
    return (
        <div className="opciones-privacidad">
            {PRIVACIDADES.map((p) => (
                <button
                    type="button"
                    key={p.valor}
                    className={valor === p.valor ? "opcion-privacidad marcada" : "opcion-privacidad"}
                    onClick={() => onElegir(p.valor)}
                >
                    <span className="opcion-icono">{p.icono}</span>
                    <strong>{p.nombre}</strong>
                    <span>{p.detalle}</span>
                </button>
            ))}
        </div>
    )
}

// Botón de los 3 puntitos de una publicación: editar, cambiar privacidad y eliminar
function MenuPost({ post, esMio, puedeBorrar, onBorrar, onCambio }) {
    const [abierto, setAbierto] = useState(false)
    const [editando, setEditando] = useState(false)
    const [texto, setTexto] = useState("")
    const [privacidad, setPrivacidad] = useState("public")
    const [error, setError] = useState("")

    const postId = post.id || post.id_publicacion
    const url = "http://localhost:3000/auth/publicaciones/" + postId
    const token = localStorage.getItem("token")
    const config = { headers: { Authorization: "Bearer " + token } }

    const abrirEdicion = () => {
        setTexto(post.content || "")
        setPrivacidad(post.privacy || "public")
        setError("")
        setAbierto(false)
        setEditando(true)
    }

    const guardar = async () => {
        try {
            await axios.put(url, { content: texto, privacy: privacidad }, config)
            setEditando(false)
            onCambio()
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo guardar")
        }
    }

    const cambiarPrivacidad = async (valor) => {
        setAbierto(false)
        try {
            await axios.put(url, { privacy: valor }, config)
            onCambio()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo cambiar la privacidad")
        }
    }

    if (!esMio && !puedeBorrar) return null

    return (
        <div className="menu-post">
            <button className="menu-post-boton" onClick={() => setAbierto(!abierto)} title="Opciones">
                <img src="/logoPuntos.png" alt="Opciones" />
            </button>

            {abierto && (
                <>
                    <div className="notif-fondo" onClick={() => setAbierto(false)} />
                    <div className="menu-post-lista">
                        {esMio && (
                            <>
                                <button onClick={abrirEdicion}>✏️ Editar publicación</button>
                                <span className="menu-post-seccion">¿Quién puede verla?</span>
                                {PRIVACIDADES.map((p) => (
                                    <button key={p.valor} className={(post.privacy || "public") === p.valor ? "elegida" : ""} onClick={() => cambiarPrivacidad(p.valor)}>
                                        {p.icono} {p.nombre}
                                        {(post.privacy || "public") === p.valor && <span className="tilde">✓</span>}
                                    </button>
                                ))}
                            </>
                        )}
                        {puedeBorrar && (
                            <button className="peligro" onClick={() => { setAbierto(false); onBorrar() }}>
                                🗑 Eliminar{!esMio ? " (admin)" : ""}
                            </button>
                        )}
                    </div>
                </>
            )}

            {editando && (
                <div className="modal-fondo" onClick={() => setEditando(false)}>
                    <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-titulo">
                            <h3>✏️ Editar publicación</h3>
                            <button className="boton-icono" onClick={() => setEditando(false)}>✕</button>
                        </div>
                        <textarea className="editar-texto" value={texto} maxLength={255} onChange={(e) => setTexto(e.target.value)} />
                        <span className="texto-suave contador-texto">{texto.length}/255</span>
                        <span className="campo-titulo">¿Quién puede verla?</span>
                        <ElegirPrivacidad valor={privacidad} onElegir={setPrivacidad} />
                        {error && <p className="aviso-error">{error}</p>}
                        <div className="modal-botones">
                            <button className="boton boton-secundario" onClick={() => setEditando(false)}>Cancelar</button>
                            <button className="boton" onClick={guardar}>Guardar cambios</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MenuPost
