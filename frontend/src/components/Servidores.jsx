import "./Chat.css"

import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { estaLogueado, getUsuario } from "../api/auth"
import axios from "axios"
import VentanaMensajes from "./VentanaMensajes"
import CanalVoz from "./CanalVoz"
import ConfigAudio from "./ConfigAudio"

function Servidores() {
    const [servidores, setServidores] = useState([])
    const [contactos, setContactos] = useState([])

    // Servidor abierto y canal elegido
    const [servidorId, setServidorId] = useState(null)
    const [datos, setDatos] = useState(null)
    const [canalId, setCanalId] = useState(null)

    // Ventanas que se abren y formularios
    const [verCrear, setVerCrear] = useState(false)
    const [verAdmin, setVerAdmin] = useState(false)
    const [verConfig, setVerConfig] = useState(false)
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
            setVerCrear(false)
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

    if (!estaLogueado()) return <Navigate to="/login" replace />

    // Separamos los canales por tipo y buscamos el canal elegido
    const canalesTexto = []
    const canalesVoz = []
    let canal = null
    if (datos) {
        for (const c of datos.canales) {
            if (c.type === "texto") canalesTexto.push(c)
            if (c.type === "voz") canalesVoz.push(c)
            if (c.id === canalId) canal = c
        }
    }

    const soyDueno = datos && datos.servidor.ownerId === yo?.id

    return (
        <div className="pagina-chat">
            {/* ---------- Columna 1: mis servidores ---------- */}
            <nav className="rail">
                {servidores.map((s) => (
                    <button
                        key={s.id}
                        className={servidorId === s.id ? "rail-servidor activo" : "rail-servidor"}
                        onClick={() => abrirServidor(s.id)}
                        title={s.name}
                    >
                        {s.name[0].toUpperCase()}
                    </button>
                ))}
                <button className="rail-servidor rail-crear" onClick={() => setVerCrear(true)} title="Crear servidor">
                    +
                </button>
            </nav>

            {/* ---------- Columna 2: canales del servidor ---------- */}
            <aside className="panel-canales">
                {!datos && (
                    <div className="vacio">
                        <span className="vacio-icono">🖥️</span>
                        <p>{servidores.length === 0 ? "Creá tu primer servidor con el botón +" : "Elegí un servidor"}</p>
                    </div>
                )}

                {datos && (
                    <>
                        <div className="panel-titulo">
                            <h2>{datos.servidor.name}</h2>
                            {soyDueno && (
                                <button className="boton-icono" onClick={() => setVerAdmin(true)} title="Administrar servidor">
                                    ⚙️
                                </button>
                            )}
                        </div>

                        <div className="lista">
                            <p className="seccion">Canales de texto</p>
                            {canalesTexto.map((c) => (
                                <button
                                    key={c.id}
                                    className={canalId === c.id ? "canal activo" : "canal"}
                                    onClick={() => setCanalId(c.id)}
                                >
                                    <span className="canal-icono">#</span> {c.name}
                                </button>
                            ))}

                            <p className="seccion">Canales de voz</p>
                            {canalesVoz.map((c) => (
                                <div key={c.id}>
                                    <button
                                        className={canalId === c.id ? "canal activo" : "canal"}
                                        onClick={() => setCanalId(c.id)}
                                    >
                                        <span className="canal-icono">🔊</span> {c.name}
                                    </button>
                                    {c.conectados.map((u) => (
                                        <div key={u.id} className="conectado">
                                            <span className="punto-verde"></span> @{u.username}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            <p className="seccion">Miembros · {datos.miembros.length}</p>
                            {datos.miembros.map((m) => (
                                <div key={m.id} className="miembro">
                                    <div className="avatar-mini">{m.username[0].toUpperCase()}</div>
                                    @{m.username}
                                    {m.id === datos.servidor.ownerId && <span title="Creador">👑</span>}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Barra de abajo: mi usuario y configuración de audio */}
                <div className="barra-usuario">
                    <div className="avatar-mini">{yo?.username ? yo.username[0].toUpperCase() : "?"}</div>
                    <strong>@{yo?.username}</strong>
                    <button className="boton-icono" onClick={() => setVerConfig(true)} title="Configuración de audio">
                        🎧
                    </button>
                </div>
            </aside>

            {/* ---------- Columna 3: el canal elegido ---------- */}
            <section className="panel-principal">
                {!canal && (
                    <div className="vacio grande">
                        <span className="vacio-icono">#</span>
                        <h3>{datos ? "Elegí un canal" : "Servidores"}</h3>
                        <p>Los canales de texto son para escribir y los de voz para hablar con tu micrófono.</p>
                    </div>
                )}

                {canal && canal.type === "texto" && (
                    <VentanaMensajes
                        key={canal.id}
                        url={"http://localhost:3000/chat/canales/" + canal.id + "/mensajes"}
                        titulo={canal.name}
                        subtitulo={"Canal de texto de " + datos.servidor.name}
                        icono="#"
                    />
                )}

                {canal && canal.type === "voz" && (
                    <CanalVoz canal={canal} yo={yo} onCambio={cargarServidor} />
                )}
            </section>

            {/* ---------- Ventana: crear servidor ---------- */}
            {verCrear && (
                <div className="modal-fondo" onClick={() => setVerCrear(false)}>
                    <form className="modal-caja" onClick={(e) => e.stopPropagation()} onSubmit={crearServidor}>
                        <div className="modal-titulo">
                            <h3>Crear un servidor</h3>
                            <button type="button" className="boton-icono" onClick={() => setVerCrear(false)}>✕</button>
                        </div>
                        <p className="texto-suave">Arranca con un canal de texto "general" y uno de voz "General".</p>
                        <input
                            type="text"
                            placeholder="Nombre del servidor"
                            value={nombreServidor}
                            onChange={(e) => setNombreServidor(e.target.value)}
                        />
                        <button type="submit" className="boton">Crear</button>
                    </form>
                </div>
            )}

            {/* ---------- Ventana: administrar servidor (solo el creador) ---------- */}
            {verAdmin && soyDueno && (
                <div className="modal-fondo" onClick={() => setVerAdmin(false)}>
                    <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-titulo">
                            <h3>⚙️ Administrar {datos.servidor.name}</h3>
                            <button className="boton-icono" onClick={() => setVerAdmin(false)}>✕</button>
                        </div>

                        <form className="campo" onSubmit={crearCanal}>
                            <span>Nuevo canal</span>
                            <input
                                type="text"
                                placeholder="Nombre del canal"
                                value={nombreCanal}
                                onChange={(e) => setNombreCanal(e.target.value)}
                            />
                            <div className="segmentado">
                                <button type="button" className={tipoCanal === "texto" ? "activo" : ""} onClick={() => setTipoCanal("texto")}>
                                    # Texto
                                </button>
                                <button type="button" className={tipoCanal === "voz" ? "activo" : ""} onClick={() => setTipoCanal("voz")}>
                                    🔊 Voz
                                </button>
                            </div>
                            <button type="submit" className="boton">Crear canal</button>
                        </form>

                        <div className="campo">
                            <span>Invitar a un contacto</span>
                            <select value={invitado} onChange={(e) => setInvitado(e.target.value)}>
                                <option value="">Elegí un contacto...</option>
                                {contactos.map((u) => (
                                    <option key={u.id} value={u.id}>@{u.username}</option>
                                ))}
                            </select>
                            <button className="boton boton-secundario" onClick={invitar}>Invitar</button>
                        </div>
                    </div>
                </div>
            )}

            {verConfig && <ConfigAudio onCerrar={() => setVerConfig(false)} />}
        </div>
    )
}

export default Servidores