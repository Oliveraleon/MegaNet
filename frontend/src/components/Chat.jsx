import "./Home.css"

import { useEffect, useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import { estaLogueado, getUsuario } from "../api/auth"
import axios from "axios"
import VentanaMensajes from "./VentanaMensajes"

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

        // Si entramos desde el perfil (/chat/:id) abrimos el chat con esa persona
        if (id) {
            const lista = res1.data.usuarios
            let encontrado = null
            for (let i = 0; i < lista.length; i++) {
                if (lista[i].id === Number(id)) {
                    encontrado = lista[i]
                }
            }
            if (encontrado) {
                setAbierto({ tipo: "privado", id: encontrado.id, nombre: "@" + encontrado.username })
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
        const res = await axios.get("http://localhost:3000/chat/grupos/" + grupo.id, config)
        setMiembros(res.data.miembros)
    }

    // Marca o desmarca un contacto para el grupo nuevo
    const marcar = (contactoId) => {
        const nueva = []
        for (let i = 0; i < seleccionados.length; i++) {
            if (seleccionados[i] !== contactoId) {
                nueva.push(seleccionados[i])
            }
        }
        if (!seleccionados.includes(contactoId)) {
            nueva.push(contactoId)
        }
        setSeleccionados(nueva)
    }

    const crearGrupo = async (e) => {
        e.preventDefault()
        try {
            await axios.post("http://localhost:3000/chat/grupos", { name: nombreGrupo, miembros: seleccionados }, config)
            setNombreGrupo("")
            setSeleccionados([])
            setError("")
            cargar()
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo crear el grupo")
        }
    }

    const agregarMiembro = async () => {
        if (nuevoMiembro === "") return
        try {
            await axios.post("http://localhost:3000/chat/grupos/" + abierto.id + "/miembros", { userId: Number(nuevoMiembro) }, config)
            setNuevoMiembro("")
            abrirGrupo({ id: abierto.id, name: abierto.nombre, ownerId: abierto.ownerId })
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo agregar")
        }
    }

    const salirDelGrupo = async () => {
        if (!confirm("¿Querés salir del grupo " + abierto.nombre + "?")) return
        await axios.delete("http://localhost:3000/chat/grupos/" + abierto.id + "/miembros", config)
        setAbierto(null)
        cargar()
    }

    if (!estaLogueado()) return <Navigate to="/login" replace />

    let url = ""
    if (abierto && abierto.tipo === "privado") {
        url = "http://localhost:3000/chat/privado/" + abierto.id
    }
    if (abierto && abierto.tipo === "grupo") {
        url = "http://localhost:3000/chat/grupos/" + abierto.id + "/mensajes"
    }

    return (
        <div className="home-container">
            <div className="chat-layout">
                <div className="chat-lista">
                    <div className="tabs">
                        <button
                            className={tab === "privados" ? "tab active" : "tab"}
                            onClick={() => setTab("privados")}
                        >
                            Privados
                        </button>
                        <button
                            className={tab === "grupos" ? "tab active" : "tab"}
                            onClick={() => setTab("grupos")}
                        >
                            Grupos
                        </button>
                    </div>

                    {error && <p className="home-error">{error}</p>}

                    {tab === "privados" && (
                        <>
                            {contactos.length === 0 && (
                                <p className="home-empty">Agregá amigos o seguí a alguien que te siga para chatear.</p>
                            )}
                            {contactos.map((u) => (
                                <button
                                    key={u.id}
                                    className={abierto?.tipo === "privado" && abierto.id === u.id ? "chat-item activo" : "chat-item"}
                                    onClick={() => setAbierto({ tipo: "privado", id: u.id, nombre: "@" + u.username })}
                                >
                                    <div className="avatar">{u.username[0].toUpperCase()}</div>
                                    @{u.username}
                                </button>
                            ))}
                        </>
                    )}

                    {tab === "grupos" && (
                        <>
                            {grupos.map((g) => (
                                <button
                                    key={g.id}
                                    className={abierto?.tipo === "grupo" && abierto.id === g.id ? "chat-item activo" : "chat-item"}
                                    onClick={() => abrirGrupo(g)}
                                >
                                    <div className="avatar">#</div>
                                    {g.name}
                                </button>
                            ))}

                            <form className="chat-crear" onSubmit={crearGrupo}>
                                <strong>Crear grupo</strong>
                                <input
                                    type="text"
                                    placeholder="Nombre del grupo"
                                    value={nombreGrupo}
                                    onChange={(e) => setNombreGrupo(e.target.value)}
                                />
                                {contactos.map((u) => (
                                    <label key={u.id}>
                                        <input
                                            type="checkbox"
                                            checked={seleccionados.includes(u.id)}
                                            onChange={() => marcar(u.id)}
                                        />
                                        @{u.username}
                                    </label>
                                ))}
                                <button type="submit" className="small-btn">Crear</button>
                            </form>
                        </>
                    )}
                </div>

                <div className="chat-derecha">
                    {!abierto && <p className="home-empty">Elegí un chat de la izquierda.</p>}

                    {abierto && abierto.tipo === "grupo" && (
                        <div className="chat-info">
                            <span>
                                Miembros:{" "}
                                {miembros.map((m) => (
                                    <span key={m.id} className="etiqueta">@{m.username}</span>
                                ))}
                            </span>

                            <div className="post-actions">
                                {abierto.ownerId === yo?.id && (
                                    <>
                                        <select value={nuevoMiembro} onChange={(e) => setNuevoMiembro(e.target.value)}>
                                            <option value="">Agregar contacto...</option>
                                            {contactos.map((u) => (
                                                <option key={u.id} value={u.id}>@{u.username}</option>
                                            ))}
                                        </select>
                                        <button className="small-btn" onClick={agregarMiembro}>Agregar</button>
                                    </>
                                )}
                                <button className="small-btn danger" onClick={salirDelGrupo}>Salir</button>
                            </div>
                        </div>
                    )}

                    {abierto && <VentanaMensajes key={url} url={url} titulo={abierto.nombre} />}
                </div>
            </div>
        </div>
    )
}

export default Chat