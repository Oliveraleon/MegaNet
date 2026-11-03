import "./Chat.css"

import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { estaLogueado, getUsuario } from "../api/auth"
import axios from "axios"
import VentanaMensajes from "./VentanaMensajes"
import CanalVoz from "./CanalVoz"
import ConfigAudio from "./ConfigAudio"

const API = "http://localhost:3000/chat/"
const IMAGENES = "http://localhost:3000/imagenes/"

function Servidores() {
    const [servidores, setServidores] = useState([])
    const [contactos, setContactos] = useState([])

    const [servidorId, setServidorId] = useState(null)
    const [datos, setDatos] = useState(null)
    const [canalId, setCanalId] = useState(null)

    const [verCrear, setVerCrear] = useState(false)
    const [verOpciones, setVerOpciones] = useState(false)
    const [verConfig, setVerConfig] = useState(false)
    const [verMiembros, setVerMiembros] = useState(true)
    const [nombreServidor, setNombreServidor] = useState("")
    const [nombreCanal, setNombreCanal] = useState("")
    const [tipoCanal, setTipoCanal] = useState("texto")
    const [invitado, setInvitado] = useState("")
    const [nuevoNombre, setNuevoNombre] = useState("")
    const [foto, setFoto] = useState(null)

    const token = localStorage.getItem("token")
    const config = { headers: { Authorization: "Bearer " + token } }
    const yo = getUsuario()

    const cargarLista = async () => {
        const res1 = await axios.get(API + "servidores", config)
        const res2 = await axios.get(API + "contactos", config)
        setServidores(res1.data.servidores)
        setContactos(res2.data.usuarios)
    }

    const cerrarServidor = () => {
        setServidorId(null)
        setDatos(null)
        setCanalId(null)
    }

    const cargarServidor = async () => {
        try {
            const res = await axios.get(API + "servidores/" + servidorId, config)
            setDatos(res.data)
        } catch {
            cerrarServidor()
        }
    }

    useEffect(() => {
        if (estaLogueado()) {
            cargarLista()
        }
    }, [])

    useEffect(() => {
        if (servidorId === null) return
        cargarServidor()
        const intervalo = setInterval(cargarServidor, 3000)
        return () => clearInterval(intervalo)
    }, [servidorId])

    const abrirServidor = (id) => {
        if (id === servidorId) return
        cerrarServidor()
        setServidorId(id)
    }

    const crearServidor = async (e) => {
        e.preventDefault()
        try {
            await axios.post(API + "servidores", { name: nombreServidor }, config)
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
            await axios.post(API + "servidores/" + servidorId + "/canales", { name: nombreCanal, type: tipoCanal }, config)
            setNombreCanal("")
            cargarServidor()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo crear el canal")
        }
    }

    const invitar = async () => {
        if (invitado === "") return
        try {
            await axios.post(API + "servidores/" + servidorId + "/miembros", { userId: Number(invitado) }, config)
            setInvitado("")
            cargarServidor()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo invitar")
        }
    }

    const guardarServidor = async (e) => {
        e.preventDefault()
        try {
            const formulario = new FormData()
            formulario.append("name", nuevoNombre)
            if (foto) formulario.append("imagen", foto)
            await axios.put(API + "servidores/" + servidorId, formulario, config)
            setFoto(null)
            cargarServidor()
            cargarLista()
            alert("Servidor actualizado")
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo guardar")
        }
    }

    const salirOEliminar = async (eliminar) => {
        if (!confirm(eliminar ? "¿Eliminar " + datos.servidor.name + " con todos sus canales y mensajes?" : "¿Salir de " + datos.servidor.name + "?")) return
        try {
            if (eliminar) {
                await axios.delete(API + "servidores/" + servidorId, config)
            } else {
                await axios.delete(API + "servidores/" + servidorId + "/miembros", config)
            }
            setVerOpciones(false)
            cerrarServidor()
            cargarLista()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo completar")
        }
    }

    if (!estaLogueado()) return <Navigate to="/login" replace />

    const canal = datos?.canales.find((c) => c.id === canalId)
    const soyDueno = datos && datos.servidor.ownerId === yo?.id

    const botonMiembros = datos && (
        <button
            className={verMiembros ? "boton-icono activo" : "boton-icono"}
            onClick={() => setVerMiembros(!verMiembros)}
            title={verMiembros ? "Ocultar miembros" : "Ver miembros"}
        >
            👥 <span className="contador">{datos.miembros.length}</span>
        </button>
    )

    return (
        <div className="pagina-chat">
            <nav className="rail">
                {servidores.map((s) => (
                    <button
                        key={s.id}
                        className={servidorId === s.id ? "rail-servidor activo" : "rail-servidor"}
                        onClick={() => abrirServidor(s.id)}
                        title={s.name}
                    >
                        {s.imagen ? <img src={IMAGENES + s.imagen} alt={s.name} /> : s.name[0].toUpperCase()}
                    </button>
                ))}
                <button className="rail-servidor rail-crear" onClick={() => setVerCrear(true)} title="Crear servidor">+</button>
            </nav>

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
                            <button
                                className="boton-icono"
                                onClick={() => { setNuevoNombre(datos.servidor.name); setFoto(null); setVerOpciones(true) }}
                                title="Opciones del servidor"
                            >
                                ⚙️
                            </button>
                        </div>

                        <div className="lista">
                            {["texto", "voz"].map((tipo) => (
                                <div key={tipo}>
                                    <p className="seccion">{tipo === "texto" ? "Canales de texto" : "Canales de voz"}</p>
                                    {datos.canales.filter((c) => c.type === tipo).map((c) => (
                                        <div key={c.id}>
                                            <button className={canalId === c.id ? "canal activo" : "canal"} onClick={() => setCanalId(c.id)}>
                                                <span className="canal-icono">{tipo === "texto" ? "#" : "🔊"}</span> {c.name}
                                            </button>
                                            {c.conectados.map((u) => (
                                                <div key={u.id} className="conectado">
                                                    <span className="punto-verde"></span> @{u.username}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className="barra-usuario">
                    <div className="avatar-mini">{yo?.username ? yo.username[0].toUpperCase() : "?"}</div>
                    <strong>@{yo?.username}</strong>
                    <button className="boton-icono" onClick={() => setVerConfig(true)} title="Configuración de audio">🎧</button>
                </div>
            </aside>

            <section className="panel-principal">
                {!canal && (
                    <>
                        {datos && <div className="barra-arriba">{botonMiembros}</div>}
                        <div className="vacio grande">
                            <span className="vacio-icono">#</span>
                            <h3>{datos ? "Elegí un canal" : "Servidores"}</h3>
                            <p>Los canales de texto son para escribir y los de voz para hablar con tu micrófono.</p>
                        </div>
                    </>
                )}

                {canal && canal.type === "texto" && (
                    <VentanaMensajes
                        key={canal.id}
                        url={API + "canales/" + canal.id + "/mensajes"}
                        titulo={canal.name}
                        subtitulo={"Canal de texto de " + datos.servidor.name}
                        icono="#"
                        miembros={datos.miembros}
                        acciones={botonMiembros}
                    />
                )}

                {canal && canal.type === "voz" && (
                    <CanalVoz canal={canal} yo={yo} onCambio={cargarServidor} acciones={botonMiembros} />
                )}
            </section>

            {datos && verMiembros && (
                <aside className="panel-miembros">
                    <div className="panel-titulo">
                        <h2>Miembros · {datos.miembros.length}</h2>
                        <button className="boton-icono" onClick={() => setVerMiembros(false)} title="Cerrar">✕</button>
                    </div>
                    <div className="lista">
                        {datos.miembros.map((m) => (
                            <div key={m.id} className="miembro">
                                <div className="avatar-mini">{m.username[0].toUpperCase()}</div>
                                <span className="miembro-nombre">
                                    @{m.username}
                                    {m.id === yo?.id && <span className="texto-suave"> (vos)</span>}
                                </span>
                                {m.id === datos.servidor.ownerId && <span title="Creador">👑</span>}
                                {datos.canales.some((c) => c.conectados.some((u) => u.id === m.id)) && <span title="En un canal de voz">🔊</span>}
                            </div>
                        ))}
                    </div>
                </aside>
            )}

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

            {verOpciones && datos && (
                <div className="modal-fondo" onClick={() => setVerOpciones(false)}>
                    <div className="modal-caja modal-ancha" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-titulo">
                            <h3>⚙️ {datos.servidor.name}</h3>
                            <button className="boton-icono" onClick={() => setVerOpciones(false)}>✕</button>
                        </div>

                        {soyDueno && (
                            <>
                                <form className="campo" onSubmit={guardarServidor}>
                                    <span>Nombre y foto</span>
                                    <div className="servidor-editar">
                                        <div className="servidor-foto">
                                            {foto ? (
                                                <img src={URL.createObjectURL(foto)} alt="Nueva foto" />
                                            ) : datos.servidor.imagen ? (
                                                <img src={IMAGENES + datos.servidor.imagen} alt="Foto actual" />
                                            ) : (
                                                datos.servidor.name[0].toUpperCase()
                                            )}
                                        </div>
                                        <div className="servidor-campos">
                                            <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Nombre del servidor" />
                                            <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0])} />
                                        </div>
                                    </div>
                                    <button type="submit" className="boton">Guardar cambios</button>
                                </form>

                                <form className="campo" onSubmit={crearCanal}>
                                    <span>Nuevo canal</span>
                                    <input type="text" placeholder="Nombre del canal" value={nombreCanal} onChange={(e) => setNombreCanal(e.target.value)} />
                                    <div className="segmentado">
                                        <button type="button" className={tipoCanal === "texto" ? "activo" : ""} onClick={() => setTipoCanal("texto")}># Texto</button>
                                        <button type="button" className={tipoCanal === "voz" ? "activo" : ""} onClick={() => setTipoCanal("voz")}>🔊 Voz</button>
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
                            </>
                        )}

                        <button className="boton boton-rojo" onClick={() => salirOEliminar(soyDueno)}>
                            {soyDueno ? "🗑️ Eliminar servidor" : "🚪 Salir del servidor"}
                        </button>
                    </div>
                </div>
            )}

            {verConfig && <ConfigAudio onCerrar={() => setVerConfig(false)} />}
        </div>
    )
}

export default Servidores