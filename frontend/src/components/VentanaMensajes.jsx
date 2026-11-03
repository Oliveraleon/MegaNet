import "./Chat.css"

import { useEffect, useState } from "react"
import { getUsuario } from "../api/auth"
import axios from "axios"

function VentanaMensajes({ url, titulo, subtitulo, icono, miembros = [], acciones }) {
    const [mensajes, setMensajes] = useState([])
    const [texto, setTexto] = useState("")
    const [error, setError] = useState("")

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

    const enviar = async (e) => {
        e.preventDefault()
        if (texto.trim() === "") return
        try {
            await axios.post(url, { content: texto }, config)
            setTexto("")
            cargar()
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo enviar el mensaje")
        }
    }

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

    return (
        <div className="ventana">
            <div className="ventana-cabecera">
                <div className="avatar-chat">{icono}</div>
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

                    {mensajes.map((m) => {
                        const palabras = m.content.split(" ")
                        const meMenciona = palabras.some((p) => buscarMencionado(p)?.id === yo?.id)
                        let clase = "burbuja"
                        if (m.autor.id === yo?.id) clase = "burbuja mia"
                        else if (meMenciona) clase = "burbuja mencionado"

                        return (
                            <div key={m.id} className={clase}>
                                {m.autor.id !== yo?.id && <strong>@{m.autor.username}</strong>}
                                <p>
                                    {palabras.map((p, i) => {
                                        const usuario = buscarMencionado(p)
                                        if (!usuario) return p + " "
                                        return <span key={i} className={usuario.id === yo?.id ? "mencion mia" : "mencion"}>{p} </span>
                                    })}
                                </p>
                                <span className="hora">
                                    {new Date(m.creationDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
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
                                <span className="avatar-mini">{u.username[0].toUpperCase()}</span>
                                @{u.username}
                                {u.id === yo?.id && <span className="texto-suave"> (vos)</span>}
                            </button>
                        ))}
                    </div>
                )}
                <input
                    id="texto-mensaje"
                    type="text"
                    placeholder="Escribí un mensaje... (usá @ para mencionar)"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                />
                <button type="submit" disabled={texto.trim() === ""}>Enviar ➤</button>
            </form>
        </div>
    )
}

export default VentanaMensajes