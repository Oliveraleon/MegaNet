import "./Home.css"

import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { estaLogueado, getUsuario } from "../api/auth"
import axios from "axios"
import VentanaMensajes from "./VentanaMensajes"

function Servidores() {
    const [servidores, setServidores] = useState([])
    const [contactos, setContactos] = useState([])

    // Servidor abierto y canal elegido
    const [servidorId, setServidorId] = useState(null)
    const [datos, setDatos] = useState(null)
    const [canalId, setCanalId] = useState(null)

    // Formularios
    const [nombreServidor, setNombreServidor] = useState("")
    const [nombreCanal, setNombreCanal] = useState("")
    const [tipoCanal, setTipoCanal] = useState("texto")
    const [invitado, setInvitado] = useState("")

    const token = localStorage.getItem("token")
    const config = { headers: { Authorization: "Bearer " + token } }
    const yo = getUsuario()

    const cargarLista = async () => {
        const res1 = await axios.get("http://localhost:3000/chat/servidores", config)
        const res2 = await axios.get("http://localhost:3000/chat/contactos", config)
        setServidores(res1.data.servidores)
        setContactos(res2.data.usuarios)
    }

    const cargarServidor = async () => {
        const res = await axios.get("http://localhost:3000/chat/servidores/" + servidorId, config)
        setDatos(res.data)
    }

    useEffect(() => {
        if (estaLogueado()) {
            cargarLista()
        }
    }, [])

    // Cuando se elige un servidor lo cargamos, y cada 3 segundos
    // lo volvemos a pedir para ver quien entra o sale de los canales de voz
    useEffect(() => {
        if (servidorId === null) return
        cargarServidor()
        const intervalo = setInterval(cargarServidor, 3000)
        return () => clearInterval(intervalo)
    }, [servidorId])

    const abrirServidor = (id) => {
        setDatos(null)
        setCanalId(null)
        setServidorId(id)
    }

    const crearServidor = async (e) => {
        e.preventDefault()
        try {
            await axios.post("http://localhost:3000/chat/servidores", { name: nombreServidor }, config)
            setNombreServidor("")
            cargarLista()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo crear el servidor")
        }
    }

    const crearCanal = async (e) => {
        e.preventDefault()
        try {
            await axios.post("http://localhost:3000/chat/servidores/" + servidorId + "/canales", { name: nombreCanal, type: tipoCanal }, config)
            setNombreCanal("")
            cargarServidor()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo crear el canal")
        }
    }

    const invitar = async () => {
        if (invitado === "") return
        try {
            await axios.post("http://localhost:3000/chat/servidores/" + servidorId + "/miembros", { userId: Number(invitado) }, config)
            setInvitado("")
            cargarServidor()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo invitar")
        }
    }

    const entrarVoz = async () => {
        await axios.post("http://localhost:3000/chat/canales/" + canalId + "/voz", {}, config)
        cargarServidor()
    }

    const salirVoz = async () => {
        await axios.delete("http://localhost:3000/chat/canales/" + canalId + "/voz", config)
        cargarServidor()
    }

    if (!estaLogueado()) return <Navigate to="/login" replace />

    // Buscamos el canal elegido dentro de los datos del servidor
    let canal = null
    if (datos) {
        for (let i = 0; i < datos.canales.length; i++) {
            if (datos.canales[i].id === canalId) {
                canal = datos.canales[i]
            }
        }
    }

    // Si es de voz, nos fijamos si yo estoy conectado
    let estoyConectado = false
    if (canal && canal.type === "voz") {
        for (let i = 0; i < canal.conectados.length; i++) {
            if (canal.conectados[i].id === yo?.id) {
                estoyConectado = true
            }
        }
    }

    const soyDueno = datos && datos.servidor.ownerId === yo?.id

    return (
        <div className="home-container">
            <div className="chat-layout">
                {/* Columna 1: mis servidores */}
                <div className="chat-lista">
                    <strong>Servidores</strong>
                    {servidores.length === 0 && <p className="home-empty">Todavía no estás en ningún servidor.</p>}
                    {servidores.map((s) => (
                        <button
                            key={s.id}
                            className={servidorId === s.id ? "chat-item activo" : "chat-item"}
                            onClick={() => abrirServidor(s.id)}
                        >
                            <div className="avatar">{s.name[0].toUpperCase()}</div>
                            {s.name}
                        </button>
                    ))}

                    <form className="chat-crear" onSubmit={crearServidor}>
                        <input
                            type="text"
                            placeholder="Nombre del servidor"
                            value={nombreServidor}
                            onChange={(e) => setNombreServidor(e.target.value)}
                        />
                        <button type="submit" className="small-btn">Crear servidor</button>
                    </form>
                </div>

                {/* Columna 2: canales del servidor */}
                {datos && (
                    <div className="chat-lista">
                        <strong>{datos.servidor.name}</strong>

                        {datos.canales.map((c) => (
                            <button
                                key={c.id}
                                className={canalId === c.id ? "chat-item activo" : "chat-item"}
                                onClick={() => setCanalId(c.id)}
                            >
                                {c.type === "texto" ? "#" : "🔊"} {c.name}
                                {c.type === "voz" && c.conectados.length > 0 && (
                                    <span className="etiqueta">{c.conectados.length}</span>
                                )}
                            </button>
                        ))}

                        <p className="post-date">
                            Miembros:{" "}
                            {datos.miembros.map((m) => (
                                <span key={m.id} className="etiqueta">@{m.username}</span>
                            ))}
                        </p>

                        {soyDueno && (
                            <>
                                <form className="chat-crear" onSubmit={crearCanal}>
                                    <input
                                        type="text"
                                        placeholder="Nombre del canal"
                                        value={nombreCanal}
                                        onChange={(e) => setNombreCanal(e.target.value)}
                                    />
                                    <select value={tipoCanal} onChange={(e) => setTipoCanal(e.target.value)}>
                                        <option value="texto">Texto</option>
                                        <option value="voz">Voz</option>
                                    </select>
                                    <button type="submit" className="small-btn">Crear canal</button>
                                </form>

                                <div className="chat-crear">
                                    <select value={invitado} onChange={(e) => setInvitado(e.target.value)}>
                                        <option value="">Invitar contacto...</option>
                                        {contactos.map((u) => (
                                            <option key={u.id} value={u.id}>@{u.username}</option>
                                        ))}
                                    </select>
                                    <button className="small-btn" onClick={invitar}>Invitar</button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Columna 3: el canal elegido */}
                <div className="chat-derecha">
                    {!canal && <p className="home-empty">Elegí un servidor y un canal.</p>}

                    {canal && canal.type === "texto" && (
                        <VentanaMensajes
                            key={canal.id}
                            url={"http://localhost:3000/chat/canales/" + canal.id + "/mensajes"}
                            titulo={"# " + canal.name}
                        />
                    )}

                    {canal && canal.type === "voz" && (
                        <div className="chat-ventana">
                            <h3 className="chat-titulo">🔊 {canal.name}</h3>
                            <p className="post-date">
                                Acá se ve quién está conectado al canal. El audio en vivo todavía no está incluido.
                            </p>

                            {canal.conectados.length === 0 && <p className="home-empty">No hay nadie conectado.</p>}
                            {canal.conectados.map((u) => (
                                <div key={u.id} className="post-author voz-usuario">
                                    <div className="avatar">{u.username[0].toUpperCase()}</div>
                                    @{u.username}
                                </div>
                            ))}

                            {estoyConectado ? (
                                <button className="small-btn danger" onClick={salirVoz}>Salir del canal</button>
                            ) : (
                                <button className="small-btn" onClick={entrarVoz}>Entrar al canal</button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Servidores