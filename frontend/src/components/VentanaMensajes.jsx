import "./Chat.css"

import { useEffect, useState } from "react"
import { getUsuario, esAdmin } from "../api/auth"
import axios from "axios"
import Avatar from "./Avatar"

// Los archivos subidos se ven desde esta dirección del backend
const ARCHIVOS = "http://localhost:3000/uploads/"
const MAXIMO_MB = 25

// Texto del separador de días: "Hoy", "Ayer" o la fecha completa
const textoDia = (fecha) => {
    const d = new Date(fecha)
    const hoy = new Date()
    const ayer = new Date()
    ayer.setDate(hoy.getDate() - 1)
    if (d.toDateString() === hoy.toDateString()) return "Hoy"
    if (d.toDateString() === ayer.toDateString()) return "Ayer"
    return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
}

function VentanaMensajes({ url, titulo, subtitulo, icono, miembros = [], acciones }) {
    const [mensajes, setMensajes] = useState([])
    const [texto, setTexto] = useState("")
    const [archivo, setArchivo] = useState(null)
    const [previa, setPrevia] = useState(null)
    const [error, setError] = useState("")
    const [visor, setVisor] = useState(null)
    const [zoom, setZoom] = useState(1)

    const token = localStorage.getItem("token")
    const config = { headers: { Authorization: "Bearer " + token } }
    const yo = getUsuario()

    const cargar = async () => {
        try {
            const res = await axios.get(url, config)
            setMensajes(res.data.mensajes)
            setError("")
        } catch (err) {
            setError(err.response?.data?.message || "No se pudieron cargar los mensajes")
        }
    }

    useEffect(() => {
        cargar()
        const intervalo = setInterval(cargar, 3000)
        return () => clearInterval(intervalo)
    }, [url])

    // Elegir archivo: se revisa el tamaño y se arma la vista previa
    const elegirArchivo = (e) => {
        const elegido = e.target.files[0]
        e.target.value = ""
        if (!elegido) return
        if (elegido.size > MAXIMO_MB * 1024 * 1024) {
            setError("El archivo pesa más de " + MAXIMO_MB + " MB")
            return
        }
        setError("")
        setArchivo(elegido)
        setPrevia(URL.createObjectURL(elegido))
    }

    const quitarArchivo = () => {
        setArchivo(null)
        setPrevia(null)
    }

    const enviar = async (e) => {
        e.preventDefault()
        if (texto.trim() === "" && !archivo) return
        try {
            const formulario = new FormData()
            formulario.append("content", texto)
            if (archivo) formulario.append("archivo", archivo)
            await axios.post(url, formulario, config)
            setTexto("")
            quitarArchivo()
            cargar()
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo enviar el mensaje")
        }
    }

    const borrar = async (id) => {
        if (!confirm("¿Borrar este mensaje?")) return
        try {
            await axios.delete("http://localhost:3000/chat/mensajes/" + id, config)
            cargar()
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo borrar el mensaje")
        }
    }

    // ---------- Menciones con @ ----------
    const ultima = texto.split(" ").pop()

    const sugerencias = []
    if (ultima.startsWith("@")) {
        for (const u of miembros) {
            if (u.username.toLowerCase().startsWith(ultima.slice(1).toLowerCase())) sugerencias.push(u)
        }
    }

    const mencionar = (u) => {
        setTexto(texto.slice(0, texto.length - ultima.length) + "@" + u.username + " ")
        document.getElementById("texto-mensaje").focus()
    }

    const buscarMencionado = (palabra) => {
        const nombre = palabra.replace(/[.,!?;:]+$/, "").toLowerCase()
        return miembros.find((u) => "@" + u.username.toLowerCase() === nombre)
    }

    // ---------- Archivos: se muestran según su extensión ----------
    const tipoDe = (nombre) => {
        const extension = nombre.split(".").pop().toLowerCase()
        if (["mp3", "wav", "ogg", "m4a", "aac", "opus"].includes(extension)) return "audio"
        if (["mp4", "webm", "mov", "ogv", "mkv"].includes(extension)) return "video"
        return "imagen"
    }

    const abrirVisor = (src, tipo) => {
        setZoom(1)
        setVisor({ src, tipo })
    }

    const mostrarArchivo = (nombre) => {
        const src = ARCHIVOS + nombre
        const tipo = tipoDe(nombre)
        if (tipo === "audio") return <audio controls src={src} />
        if (tipo === "video") {
            return (
                <>
                    <video controls src={src} />
                    <button type="button" className="ampliar" onClick={() => abrirVisor(src, "video")}>⤢ Ampliar</button>
                </>
            )
        }
        return <img src={src} alt="imagen" title="Click para ampliar" onClick={() => abrirVisor(src, "imagen")} />
    }

    const cabecera = typeof icono === "string" ? <div className="avatar-chat">{icono}</div> : icono

    return (
        <div className="ventana">
            <div className="ventana-cabecera">
                {cabecera}
                <div className="cabecera-texto">
                    <h3>{titulo}</h3>
                    {subtitulo && <span className="texto-suave">{subtitulo}</span>}
                </div>
                {acciones && <div className="cabecera-acciones">{acciones}</div>}
            </div>

            {error && <p className="aviso-error">{error}</p>}

            <div className="mensajes">
                <div>
                    {mensajes.length === 0 && (
                        <div className="vacio">
                            <span className="vacio-icono">💬</span>
                            <p>Todavía no hay mensajes. ¡Escribí el primero!</p>
                        </div>
                    )}

                    {mensajes.map((m, i) => {
                        const autor = m.autor || { id: 0, username: "usuario" }
                        const anterior = mensajes[i - 1]
                        const nuevoDia = !anterior || new Date(anterior.creationDate).toDateString() !== new Date(m.creationDate).toDateString()
                        // "seguido" = mismo autor que el mensaje de arriba: no se repite nombre ni foto
                        const seguido = !nuevoDia && anterior.autor?.id === autor.id
                        const esMio = autor.id === yo?.id
                        const palabras = m.content.split(" ")
                        const meMenciona = palabras.some((p) => buscarMencionado(p)?.id === yo?.id)

                        let clase = "burbuja"
                        if (esMio) clase = "burbuja mia"
                        else if (meMenciona) clase = "burbuja mencionado"

                        let fila = "fila-mensaje"
                        if (esMio) fila += " mia"
                        if (seguido) fila += " seguido"

                        return (
                            <div key={m.id}>
                                {nuevoDia && <div className="separador-dia"><span>{textoDia(m.creationDate)}</span></div>}

                                <div className={fila}>
                                    {!esMio && (seguido ? <div className="avatar-espacio" /> : <Avatar usuario={autor} clase="avatar-mini" perfil />)}

                                    <div className={clase}>
                                        {!esMio && !seguido && <strong>@{autor.username}</strong>}
                                        {m.archivo && <div className="adjunto">{mostrarArchivo(m.archivo)}</div>}
                                        {m.content && <p>
                                            {palabras.map((p, j) => {
                                                const usuario = buscarMencionado(p)
                                                if (!usuario) return p + " "
                                                return <span key={j} className={usuario.id === yo?.id ? "mencion mia" : "mencion"}>{p} </span>
                                            })}
                                        </p>}
                                        <span className="hora">
                                            {new Date(m.creationDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>

                                    {(esMio || esAdmin()) && (
                                        <button type="button" className="borrar-mensaje" onClick={() => borrar(m.id)} title="Borrar mensaje">🗑</button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <form className="escribir" onSubmit={enviar}>
                {sugerencias.length > 0 && (
                    <div className="sugerencias">
                        <span className="texto-suave">Mencionar a...</span>
                        {sugerencias.map((u) => (
                            <button type="button" key={u.id} onClick={() => mencionar(u)}>
                                <Avatar usuario={u} clase="avatar-mini" />
                                @{u.username}
                                {u.id === yo?.id && <span className="texto-suave"> (vos)</span>}
                            </button>
                        ))}
                    </div>
                )}

                {archivo && (
                    <div className="previa-adjunto">
                        {archivo.type.startsWith("image/") && <img src={previa} alt="vista previa" />}
                        {archivo.type.startsWith("video/") && <video src={previa} controls />}
                        {archivo.type.startsWith("audio/") && <audio src={previa} controls />}
                        <div className="previa-info">
                            <strong>{archivo.name}</strong>
                            <span className="texto-suave">{(archivo.size / 1024 / 1024).toFixed(2)} MB · listo para enviar</span>
                        </div>
                        <button type="button" className="boton-icono" onClick={quitarArchivo} title="Quitar archivo">✕</button>
                    </div>
                )}

                <label className="boton-adjuntar" title="Adjuntar imagen, audio o video">
                    📎
                    <input type="file" accept="image/*,audio/*,video/*" hidden onChange={elegirArchivo} />
                </label>
                <input
                    id="texto-mensaje"
                    type="text"
                    autoComplete="off"
                    placeholder="Escribí un mensaje... (usá @ para mencionar)"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                />
                <button type="submit" disabled={texto.trim() === "" && !archivo}>Enviar ➤</button>
            </form>

            {visor && (
                <div className="visor-fondo" onClick={() => setVisor(null)}>
                    <div className="visor-barra" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} title="Achicar">−</button>
                        <span>{Math.round(zoom * 100)}%</span>
                        <button type="button" onClick={() => setZoom(Math.min(3, zoom + 0.25))} title="Agrandar">+</button>
                        <button type="button" onClick={() => setZoom(1)}>Ajustar</button>
                        <a href={visor.src} target="_blank" rel="noreferrer">Abrir original</a>
                        <button type="button" onClick={() => setVisor(null)} title="Cerrar">✕</button>
                    </div>
                    <div className="visor-contenido">
                        {visor.tipo === "video" ? (
                            <video src={visor.src} controls autoPlay style={{ height: 70 * zoom + "vh" }} onClick={(e) => e.stopPropagation()} />
                        ) : (
                            <img src={visor.src} alt="archivo ampliado" style={{ height: 70 * zoom + "vh" }} onClick={(e) => e.stopPropagation()} />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default VentanaMensajes
