import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { estaLogueado } from "../api/auth"
import "./Amigos.css"
import axios from "axios"

function Amigos() {
    const [tab, setTab] = useState("amigos")
    const [amigos, setAmigos] = useState([])
    const [solicitudes, setSolicitudes] = useState([])

    const token = localStorage.getItem("token")
    const config = { headers: { Authorization: "Bearer " + token } }

    const cargar = async () => {
        const res1 = await axios.get("http://localhost:3000/user/amigos", config)
        const res2 = await axios.get("http://localhost:3000/user/solicitudes", config)

        setAmigos(res1.data.usuarios)
        setSolicitudes(res2.data.usuarios)
    }

    useEffect(() => {
        if (estaLogueado()) {
            cargar()
        }
    }, [])

    const aceptar = async (id) => {
        await axios.post("http://localhost:3000/user/amistad/" + id + "/aceptar", {}, config)
        cargar()
    }

    // Sirve para rechazar una solicitud o para eliminar a un amigo
    const eliminar = async (id) => {
        if (tab === "amigos" && !confirm("¿Querés eliminar a este amigo?")) return
        await axios.delete("http://localhost:3000/user/amistad/" + id, config)
        cargar()
    }

    if (!estaLogueado()) return <Navigate to="/login" replace />

    const lista = tab === "amigos" ? amigos : solicitudes

    return (
        <div className="home-container">
            <div className="conexiones-box">
                <div className="tabs">
                    <button
                        className={tab === "amigos" ? "tab active" : "tab"}
                        onClick={() => setTab("amigos")}
                    >
                        {amigos.length} amigos
                    </button>
                    <button
                        className={tab === "solicitudes" ? "tab active" : "tab"}
                        onClick={() => setTab("solicitudes")}
                    >
                        {solicitudes.length} solicitudes
                    </button>
                </div>

                {lista.length === 0 && (
                    <p className="home-empty">
                        {tab === "amigos" ? "Todavía no tenés amigos." : "No tenés solicitudes pendientes."}
                    </p>
                )}

                {lista.map((u) => (
                    <div className="user-row" key={u.id}>
                        <div className="post-author">
                            <div className="avatar">{u.username[0].toUpperCase()}</div>
                            <Link to={"/usuario/" + u.id} className="autor-link">
                                <strong>@{u.username}</strong>
                            </Link>
                        </div>

                        {tab === "amigos" ? (
                            <button className="small-btn danger" onClick={() => eliminar(u.id)}>Eliminar</button>
                        ) : (
                            <div className="post-actions">
                                <button className="small-btn" onClick={() => aceptar(u.id)}>Aceptar</button>
                                <button className="small-btn danger" onClick={() => eliminar(u.id)}>Rechazar</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Amigos