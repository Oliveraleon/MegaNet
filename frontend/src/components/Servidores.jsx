import "./Chat.css"

import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { estaLogueado, getUsuario, esAdmin } from "../api/auth"
import Calendario from "./Calendario"
import axios from "axios"
import VentanaMensajes from "./VentanaMensajes"
import Avatar from "./Avatar"

const API = "http://localhost:3000/chat/"
const IMAGENES = "http://localhost:3000/uploads/"

function Servidores() {
    const [servidores, setServidores] = useState([])
    const [contactos, setContactos] = useState([])

    const [servidorId, setServidorId] = useState(null)
    const [datos, setDatos] = useState(null)
    const [canalId, setCanalId] = useState(null)

    const [verCrear, setVerCrear] = useState(false)
    const [verOpciones, setVerOpciones] = useState(false)
    const [verMiembros, setVerMiembros] = useState(true)
    const [verCalendario, setVerCalendario] = useState(false)
    const [nombreServidor, setNombreServidor] = useState("")
    const [nombreCanal, setNombreCanal] = useState("")
    const [invitado, setInvitado] = useState("")
    const [nuevoNombre, setNuevoNombre] = useState("")
    const [foto, setFoto] = useState(null)
    const [error, setError] = useState("")

    const token = localStorage.getItem("token")
    const config = { headers: { Authorization: "Bearer " + token } }
    const yo = getUsuario()

    const cargarLista = async () => {
        try {
            const res1 = await axios.get(API + "servidores", config)
            const res2 = await axios.get(API + "contactos", config)
            setServidores(res1.data.servidores)
            setContactos(res2.data.usuarios)
            setError("")
        } catch (err) {
            setError(err.response?.data?.message || "No se pudieron cargar los servidores. ¿Está prendido el backend?")
        }
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
            await axios.post(API + "servidores/" + servidorId + "/canales", { name: nombreCanal }, config)
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

        const expulsarMiembro = async (m) => {
        if (!confirm("¿Sacar a @" + m.username + " del servidor?")) return
        try {
            await axios.delete(API + "servidores/" + servidorId + "/miembros/" + m.id, config)
            cargarServidor()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo sacar al miembro")
        }
    }

    const pasarPropiedad = async (m) => {
        if (!confirm("¿Pasarle la propiedad del servidor a @" + m.username + "?")) return
        try {
            await axios.put(API + "servidores/" + servidorId + "/propietario", { userId: m.id }, config)
            cargarServidor()
            cargarLista()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo pasar la propiedad")
        }
    }

    if (!estaLogueado()) return <Navigate to="/login" replace />

    const canal = datos?.canales.find((c) => c.id === canalId)
    const soyDueno = datos && datos.servidor.ownerId === yo?.id
    // El dueño y el admin pueden editar, crear canales, invitar y eliminar
    const puedoAdministrar = datos && (soyDueno || esAdmin())
    const soyMiembro = datos && datos.miembros.some((m) => m.id === yo?.id)

        const botonMiembros = datos && (
        <>
            <button
                className={verCalendario ? "boton-icono activo" : "boton-icono"}
                onClick={() => setVerCalendario(!verCalendario)}
                title="Calendario del servidor"
            >
                📅
            </button>
            <button
                className={verMiembros ? "boton-icono activo" : "boton-icono"}
                onClick={() => setVerMiembros(!verMiembros)}
                title={verMiembros ? "Ocultar miembros" : "Ver miembros"}
            >
                👥 <span className="contador">{datos.miembros.length}</span>
            </button>
        </>
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
                {error && <p className="aviso-error">{error}</p>}

                {!datos && (
                    <div className="vacio">
                        <span className="vacio-icono">🖥️</span>
                        <p>{servidores.length === 0 ? "Creá tu primer servidor con el botón +" : "Elegí un servidor de la izquierda"}</p>
                        {esAdmin() && <p className="aviso-admin">🛡️ Sos administrador: ves todos los servidores</p>}
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
                            <p className="seccion">Canales de texto</p>
                            {datos.canales.map((c) => (
                                <button key={c.id} className={canalId === c.id ? "canal activo" : "canal"} onClick={() => setCanalId(c.id)}>
                                    <span className="canal-icono">#</span> {c.name}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                <div className="barra-usuario">
                    <Avatar usuario={yo} clase="avatar-mini" />
                    <strong>@{yo?.username}</strong>
                    {esAdmin() && <span className="etiqueta-admin">Admin</span>}
                </div>
            </aside>

            <section className="panel-principal">
                {!canal && (
                    <>
                        {datos && <div className="barra-arriba">{botonMiembros}</div>}
                        <div className="vacio grande">
                            <span className="vacio-icono">#</span>
                            <h3>{datos ? "Elegí un canal" : "Servidores"}</h3>
                               <p>Elegí un canal de texto de la izquierda para empezar a escribir.</p>
                        </div>
                    </>
                )}

                {canal && (
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
            </section>

            {datos && verCalendario && (
                <aside className="panel-calendario">
                    <div className="panel-titulo">
                        <h2>📅 Calendario</h2>
                        <button className="boton-icono" onClick={() => setVerCalendario(false)} title="Cerrar">✕</button>
                    </div>
                    <Calendario key={servidorId} rutaEventos={"servidores/" + servidorId + "/eventos"} puedeModerar={puedoAdministrar} />
                </aside>
            )}

            {datos && verMiembros && (
                <aside className="panel-miembros">
                    <div className="panel-titulo">
                        <h2>Miembros · {datos.miembros.length}</h2>
                        <button className="boton-icono" onClick={() => setVerMiembros(false)} title="Cerrar">✕</button>
                    </div>
                    <div className="lista">
                        {datos.miembros.map((m) => (
                            <div key={m.id} className="miembro">
                                <Avatar usuario={m} clase="avatar-mini" perfil />
                                <span className="miembro-nombre">
                                    @{m.username}
                                    {m.id === yo?.id && <span className="texto-suave"> (vos)</span>}
                                </span>
                                {m.id === datos.servidor.ownerId && <span title="Creador">👑</span>}
                                {puedoAdministrar && m.id !== datos.servidor.ownerId && (
                                    <>
                                        <button type="button" className="boton-chico" onClick={() => pasarPropiedad(m)} title="Pasarle la propiedad">👑</button>
                                        <button type="button" className="boton-chico" onClick={() => expulsarMiembro(m)} title="Sacar del servidor">🚫</button>
                                    </>
                                )}
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
                        <p className="texto-suave">Arranca con un canal de texto "general".</p>
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

                        {puedoAdministrar && !soyDueno && (
                            <p className="aviso-admin">🛡️ Estás editando como administrador</p>
                        )}

                        {puedoAdministrar && (
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
                                            <label className="boton-archivo">
                                                📷 {foto ? foto.name : "Elegir foto"}
                                                <input type="file" accept="image/*" hidden onChange={(e) => setFoto(e.target.files[0])} />
                                            </label>
                                        </div>
                                    </div>
                                    <button type="submit" className="boton">Guardar cambios</button>
                                </form>

                                <form className="campo" onSubmit={crearCanal}>
                                    <span>Nuevo canal</span>
                                    <input type="text" placeholder="Nombre del canal" value={nombreCanal} onChange={(e) => setNombreCanal(e.target.value)} />
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

                        {soyMiembro && !soyDueno && (
                            <button className="boton boton-secundario" onClick={() => salirOEliminar(false)}>🚪 Salir del servidor</button>
                        )}
                        {puedoAdministrar && (
                            <button className="boton boton-rojo" onClick={() => salirOEliminar(true)}>🗑️ Eliminar servidor</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Servidores