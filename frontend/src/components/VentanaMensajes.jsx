import "./Home.css"

import { useEffect, useState } from "react"
import { getUsuario } from "../api/auth"
import axios from "axios"

// Ventana de chat que se usa para los chats privados, los grupos y los canales de texto.
// Recibe por props la url de donde lee y a donde manda los mensajes.
function VentanaMensajes({ url, titulo }) {
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

    // Carga los mensajes y los vuelve a pedir cada 3 segundos para ver los nuevos.
    // Cuando se cierra la ventana o cambia la url, se corta el intervalo.
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

    return (
        <div className="chat-ventana">
            <h3 className="chat-titulo">{titulo}</h3>

            {error && <p className="home-error">{error}</p>}

            <div className="chat-mensajes">
                <div>
                    {mensajes.length === 0 && (
                        <p className="home-empty">Todavía no hay mensajes. ¡Escribí el primero!</p>
                    )}

                    {mensajes.map((m) => (
                        <div key={m.id} className={m.autor.id === yo?.id ? "mensaje mio" : "mensaje"}>
                            <strong>@{m.autor.username}</strong>
                            <p>{m.content}</p>
                            <span className="post-date">
                                {new Date(m.creationDate).toLocaleTimeString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <form className="chat-form" onSubmit={enviar}>
                <input
                    type="text"
                    placeholder="Escribí un mensaje..."
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                />
                <button type="submit">Enviar</button>
            </form>
        </div>
    )
}

export default VentanaMensajes