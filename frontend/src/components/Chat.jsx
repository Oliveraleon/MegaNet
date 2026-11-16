import "./Chat.css"

import { useEffect, useState } from "react"
import { Navigate, useParams, Link } from "react-router-dom"
import { estaLogueado, getUsuario, esAdmin } from "../api/auth"
import axios from "axios"
import VentanaMensajes from "./VentanaMensajes"
import Avatar from "./Avatar"
import Calendario from "./Calendario"

const API = "http://localhost:3000/chat/"

function Chat() {
    const { id } = useParams()
    const [tab, setTab] = useState("privados")
    const [contactos, setContactos] = useState([])
    const [grupos, setGrupos] = useState([])

    const [abierto, setAbierto] = useState(null)
    const [miembros, setMiembros] = useState([])
    const [nuevoMiembro, setNuevoMiembro] = useState("")
    const [verCalendario, setVerCalendario] = useState(false)
    const [verOpciones, setVerOpciones] = useState(false)

    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [nombreGrupo, setNombreGrupo] = useState("")
    const [seleccionados, setSeleccionados] = useState([])
    const [error, setError] = useState("")

    const token = localStorage.getItem("token")
    const config = { headers: { Authorization: "Bearer " + token } }
    const yo = getUsuario()
    const admin = esAdmin()

    const abrirPrivado = (u) => {
        setVerCalendario(false)
        setAbierto({ tipo: "privado", id: u.id, nombre: "@" + u.username, usuario: u })
    }

    const cargar = async () => {
        try {
            const res1 = await axios.get(API + "contactos", config)
            const res2 = await axios.get(API + "grupos", config)
            setContactos(res1.data.usuarios)
            setGrupos(res2.data.grupos)

            if (id) {
                const persona = res1.data.usuarios.find((u) => u.id === Number(id))
                if (persona) {
                    abrirPrivado(persona)
                } else {
                    setError("Solo podés chatear con amigos o con personas que se siguen mutuamente")
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "No se pudieron cargar los chats. ¿Está prendido el backend?")
        }
    }

    useEffect(() => {
        if (estaLogueado()) {
            cargar()
        }
    }, [id])

    const abrirGrupo = async (grupo) => {
        setAbierto({ tipo: "grupo", id: grupo.id, nombre: grupo.name, ownerId: grupo.ownerId })
        try {
            const res = await axios.get(API + "grupos/" + grupo.id, config)
            setMiembros(res.data.miembros)
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo abrir el grupo")
        }
    }

    const marcar = (contactoId) => {
        if (seleccionados.includes(contactoId)) {
            setSeleccionados(seleccionados.filter((s) => s !== contactoId))
        } else {
            setSeleccionados([...seleccionados, contactoId])
        }
    }

    const crearGrupo = async (e) => {
        e.preventDefault()
        try {
            await axios.post(API + "grupos", { name: nombreGrupo, miembros: seleccionados }, config)
            setNombreGrupo("")
            setSeleccionados([])
            setMostrarFormulario(false)
            setError("")
            cargar()
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo crear el grupo")
        }
    }

    const agregarMiembro = async () => {
        if (nuevoMiembro === "") return
        try {
            await axios.post(API + "grupos/" + abierto.id + "/miembros", { userId: Number(nuevoMiembro) }, config)
            setNuevoMiembro("")
            setVerOpciones(false)
            abrirGrupo({ id: abierto.id, name: abierto.nombre, ownerId: abierto.ownerId })
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo agregar")
        }
    }

    const salirDelGrupo = async () => {
        if (!confirm("¿Querés salir del grupo " + abierto.nombre + "?")) return
        await axios.delete(API + "grupos/" + abierto.id + "/miembros", config)
        setVerOpciones(false)
        setVerCalendario(false)
        setAbierto(null)
        cargar()
    }

    const eliminarGrupo = async () => {
        if (!confirm("¿Eliminar el grupo " + abierto.nombre + " con todos sus mensajes y eventos?")) return
        try {
            await axios.delete(API + "grupos/" + abierto.id, config)
            setVerOpciones(false)
            setAbierto(null)
            setVerCalendario(false)
            cargar()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo eliminar el grupo")
        }
    }

    if (!estaLogueado()) return <Navigate to="/login" replace />

    const esGrupo = abierto?.tipo === "grupo"
    const soyMiembro = miembros.some((m) => m.id === yo?.id)
    const puedoAdministrar = esGrupo && (abierto.ownerId === yo?.id || admin)

    // Botones que van arriba a la derecha del chat de un grupo
    const accionesGrupo = esGrupo && (
        <>
            <div className="pila-avatares" title={miembros.map((m) => "@" + m.username).join(", ")}>
                {miembros.slice(0, 4).map((m) => (
                    <Avatar key={m.id} usuario={m} clase="avatar-mini" />
                ))}
                {miembros.length > 4 && <span className="avatar-mini mas">+{miembros.length - 4}</span>}
            </div>
            <button className={verCalendario ? "boton-chico activo" : "boton-chico"} onClick={() => setVerCalendario(!verCalendario)}>
                📅 Calendario
            </button>
            <button className="boton-icono" onClick={() => setVerOpciones(true)} title="Opciones del grupo">⚙️</button>
        </>
    )

    let url = ""
    let mencionables = []
    if (abierto && !esGrupo) {
        url = API + "privado/" + abierto.id
        mencionables = [yo, abierto.usuario]
    }
    if (esGrupo) {
        url = API + "grupos/" + abierto.id + "/mensajes"
        mencionables = miembros
    }

    return (
        <div className="pagina-chat">
            <aside className="panel-lista">
                <div className="panel-titulo">
                    <h2>Mensajes</h2>
                    {tab === "grupos" && (
                        <button className="boton-chico" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
                            {mostrarFormulario ? "Cancelar" : "+ Nuevo grupo"}
                        </button>
                    )}
                </div>

                <div className="segmentado">
                    <button className={tab === "privados" ? "activo" : ""} onClick={() => setTab("privados")}>👤 Privados</button>
                    <button className={tab === "grupos" ? "activo" : ""} onClick={() => setTab("grupos")}>👥 Grupos</button>
                </div>

                {error && <p className="aviso-error">{error}</p>}

                {tab === "privados" && (
                    <div className="lista">
                        {contactos.length === 0 && (
                            <div className="vacio">
                                <span className="vacio-icono">🤝</span>
                                <p>Para chatear tienen que ser amigos o seguirse mutuamente.</p>
                                <Link to="/buscador" className="boton-chico">Buscar personas</Link>
                            </div>
                        )}
                        {contactos.map((u) => (
                            <button
                                key={u.id}
                                className={abierto?.tipo === "privado" && abierto.id === u.id ? "item activo" : "item"}
                                onClick={() => abrirPrivado(u)}
                            >
                                <Avatar usuario={u} />
                                <div className="item-texto">
                                    <strong>@{u.username}</strong>
                                    <span>Chat privado</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {tab === "grupos" && (
                    <div className="lista">
                        {admin && <p className="aviso-admin">🛡️ Sos administrador: ves todos los grupos</p>}

                        {mostrarFormulario && (
                            <form className="tarjeta-form" onSubmit={crearGrupo}>
                                <input
                                    type="text"
                                    placeholder="Nombre del grupo"
                                    value={nombreGrupo}
                                    onChange={(e) => setNombreGrupo(e.target.value)}
                                />
                                <span className="texto-suave">Elegí quiénes van a estar:</span>
                                <div className="chips">
                                    {contactos.length === 0 && <span className="texto-suave">Todavía no tenés contactos.</span>}
                                    {contactos.map((u) => (
                                        <button
                                            type="button"
                                            key={u.id}
                                            className={seleccionados.includes(u.id) ? "chip marcado" : "chip"}
                                            onClick={() => marcar(u.id)}
                                        >
                                            <Avatar usuario={u} clase="avatar-mini" />
                                            {seleccionados.includes(u.id) ? "✓ " : ""}@{u.username}
                                        </button>
                                    ))}
                                </div>
                                <button type="submit" className="boton">Crear grupo</button>
                            </form>
                        )}

                        {grupos.length === 0 && !mostrarFormulario && (
                            <div className="vacio">
                                <span className="vacio-icono">👥</span>
                                <p>Todavía no estás en ningún grupo.</p>
                            </div>
                        )}
                        {grupos.map((g) => (
                            <button
                                key={g.id}
                                className={esGrupo && abierto.id === g.id ? "item activo" : "item"}
                                onClick={() => abrirGrupo(g)}
                            >
                                <div className="avatar-chat grupo">{g.name[0].toUpperCase()}</div>
                                <div className="item-texto">
                                    <strong>{g.name}</strong>
                                    <span>{g.ownerId === yo?.id ? "Grupo · sos el creador" : "Grupo"}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </aside>

            <section className="panel-principal">
                {!abierto && (
                    <div className="vacio grande">
                        <span className="vacio-icono">💬</span>
                        <h3>Tus mensajes</h3>
                        <p>Elegí un chat o un grupo de la izquierda para empezar a hablar.</p>
                    </div>
                )}

                {abierto && (
                    <VentanaMensajes
                        key={url}
                        url={url}
                        titulo={abierto.nombre}
                        subtitulo={esGrupo ? miembros.length + " miembros · " + miembros.map((m) => "@" + m.username).join(", ") : "Chat privado"}
                        icono={esGrupo ? abierto.nombre[0].toUpperCase() : <Avatar usuario={abierto.usuario} />}
                        miembros={mencionables}
                        acciones={accionesGrupo}
                    />
                )}
            </section>

            {esGrupo && verCalendario && (
                <aside className="panel-calendario">
                    <div className="panel-titulo">
                        <h2>📅 Calendario</h2>
                        <button className="boton-icono" onClick={() => setVerCalendario(false)} title="Cerrar">✕</button>
                    </div>
                    <Calendario key={abierto.id} grupoId={abierto.id} puedeModerar={puedoAdministrar} />
                </aside>
            )}

            {esGrupo && verOpciones && (
                <div className="modal-fondo" onClick={() => setVerOpciones(false)}>
                    <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-titulo">
                            <h3>⚙️ {abierto.nombre}</h3>
                            <button className="boton-icono" onClick={() => setVerOpciones(false)}>✕</button>
                        </div>

                        {admin && abierto.ownerId !== yo?.id && <p className="aviso-admin">🛡️ Estás como administrador</p>}

                        <div className="campo">
                            <span>Miembros · {miembros.length}</span>
                            <div className="lista-miembros">
                                {miembros.map((m) => (
                                    <div key={m.id} className="miembro">
                                        <Avatar usuario={m} clase="avatar-mini" />
                                        <span className="miembro-nombre">
                                            @{m.username}
                                            {m.id === yo?.id && <span className="texto-suave"> (vos)</span>}
                                        </span>
                                        {m.id === abierto.ownerId && <span title="Creador">👑</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {puedoAdministrar && (
                            <div className="campo">
                                <span>Agregar a un contacto</span>
                                <select value={nuevoMiembro} onChange={(e) => setNuevoMiembro(e.target.value)}>
                                    <option value="">Elegí un contacto...</option>
                                    {contactos.filter((u) => !miembros.some((m) => m.id === u.id)).map((u) => (
                                        <option key={u.id} value={u.id}>@{u.username}</option>
                                    ))}
                                </select>
                                <button className="boton boton-secundario" onClick={agregarMiembro}>Agregar al grupo</button>
                            </div>
                        )}

                        {soyMiembro && abierto.ownerId !== yo?.id && (
                            <button className="boton boton-secundario" onClick={salirDelGrupo}>🚪 Salir del grupo</button>
                        )}
                        {puedoAdministrar && (
                            <button className="boton boton-rojo" onClick={eliminarGrupo}>🗑️ Eliminar grupo</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Chat
