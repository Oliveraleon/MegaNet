import "./Chat.css"

import { useEffect, useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import { estaLogueado, getUsuario } from "../api/auth"
import axios from "axios"
import VentanaMensajes from "./VentanaMensajes"

const API = "http://localhost:3000/chat/"

function Chat() {
    const { id } = useParams()
    const [tab, setTab] = useState("privados")
    const [contactos, setContactos] = useState([])
    const [grupos, setGrupos] = useState([])

    // Chat abierto: null o { tipo: "privado" | "grupo", id, nombre }
    const [abierto, setAbierto] = useState(null)
    const [miembros, setMiembros] = useState([])
    const [nuevoMiembro, setNuevoMiembro] = useState("")

    // Formulario para crear un grupo
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [nombreGrupo, setNombreGrupo] = useState("")
    const [seleccionados, setSeleccionados] = useState([])
    const [error, setError] = useState("")

    const token = localStorage.getItem("token")
    const config = { headers: { Authorization: "Bearer " + token } }
    const yo = getUsuario()

    const cargar = async () => {
        const res1 = await axios.get("http://localhost:3000/chat/contactos", config)
        const res2 = await axios.get("http://localhost:3000/chat/grupos", config)
        setContactos(res1.data.usuarios)
        setGrupos(res2.data.grupos)

            if (id) {
            const persona = res1.data.usuarios.find((u) => u.id === Number(id))
            if (persona) {
                setAbierto({ tipo: "privado", id: persona.id, nombre: "@" + persona.username })
            } else {
                setError("Solo podés chatear con amigos o con personas que se siguen mutuamente")
            }
        }
    }

    useEffect(() => {
        if (estaLogueado()) {
            cargar()
        }
    }, [id])

    const abrirGrupo = async (grupo) => {
        setAbierto({ tipo: "grupo", id: grupo.id, nombre: grupo.name, ownerId: grupo.ownerId })
        const res = await axios.get(API + "grupos/" + grupo.id, config)
        setMiembros(res.data.miembros)
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
            await axios.post("http://localhost:3000/chat/grupos", { name: nombreGrupo, miembros: seleccionados }, config)
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
            abrirGrupo({ id: abierto.id, name: abierto.nombre, ownerId: abierto.ownerId })
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo agregar")
        }
    }

    const salirDelGrupo = async () => {
        if (!confirm("¿Querés salir del grupo " + abierto.nombre + "?")) return
        await axios.delete(API + "grupos/" + abierto.id + "/miembros", config)
        setAbierto(null)
        cargar()
    }

    if (!estaLogueado()) return <Navigate to="/login" replace />

    const esGrupo = abierto?.tipo === "grupo"
    let url = ""
    let mencionables = []
    if (abierto && !esGrupo) {
        url = API + "privado/" + abierto.id
        mencionables = [{ id: yo?.id, username: yo?.username }, { id: abierto.id, username: abierto.nombre.slice(1) }]
    }
    if (esGrupo) {
        url = API + "grupos/" + abierto.id + "/mensajes"
        mencionables = miembros
    }

    return (
        <div className="pagina-chat">
            {/* ---------- Lista de la izquierda ---------- */}
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
                            <p className="texto-suave centrado">Agregá amigos o seguí a alguien que te siga para poder chatear.</p>
                        )}
                        {contactos.map((u) => (
                            <button
                                key={u.id}
                                className={abierto?.tipo === "privado" && abierto.id === u.id ? "item activo" : "item"}
                                onClick={() => setAbierto({ tipo: "privado", id: u.id, nombre: "@" + u.username })}
                            >
                                <div className="avatar-chat">{u.username[0].toUpperCase()}</div>
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
                                    {contactos.map((u) => (
                                        <button
                                            type="button"
                                            key={u.id}
                                            className={seleccionados.includes(u.id) ? "chip marcado" : "chip"}
                                            onClick={() => marcar(u.id)}
                                        >
                                            {seleccionados.includes(u.id) ? "✓ " : "+ "}@{u.username}
                                        </button>
                                    ))}
                                </div>
                                <button type="submit" className="boton">Crear grupo</button>
                            </form>
                        )}

                        {grupos.length === 0 && !mostrarFormulario && (
                            <p className="texto-suave centrado">Todavía no estás en ningún grupo.</p>
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
                                    <span>Grupo</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </aside>

            {/* ---------- Chat abierto ---------- */}
            <section className="panel-principal">
                {!abierto && (
                    <div className="vacio grande">
                        <span className="vacio-icono">💬</span>
                        <h3>Tus mensajes</h3>
                        <p>Elegí un chat o un grupo de la izquierda para empezar a hablar.</p>
                    </div>
                )}

                {esGrupo && (
                    <div className="barra-grupo">
                        <div className="chips">
                            {miembros.map((m) => (
                                <span key={m.id} className="chip fijo">@{m.username}</span>
                            ))}
                        </div>
                        <div className="acciones">
                            {abierto.ownerId === yo?.id && (
                                <>
                                    <select value={nuevoMiembro} onChange={(e) => setNuevoMiembro(e.target.value)}>
                                        <option value="">Agregar contacto...</option>
                                        {contactos.map((u) => (
                                            <option key={u.id} value={u.id}>@{u.username}</option>
                                        ))}
                                    </select>
                                    <button className="boton-chico" onClick={agregarMiembro}>Agregar</button>
                                </>
                            )}
                            <button className="boton-chico peligro" onClick={salirDelGrupo}>Salir</button>
                        </div>
                    </div>
                )}

                {abierto && (
                    <VentanaMensajes
                        key={url}
                        url={url}
                        titulo={abierto.nombre}
                        subtitulo={esGrupo ? miembros.length + " miembros" : "Chat privado"}
                        icono={esGrupo ? abierto.nombre[0].toUpperCase() : abierto.nombre[1].toUpperCase()}
                        miembros={mencionables}
                    />
                )}
            </section>
        </div>
    )
}

export default Chat