import "./Chat.css"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const API = "http://localhost:3000/notificaciones"

// "ahora", "hace 5 min", "hace 2 h", "hace 3 d"
const hace = (fecha) => {
    const minutos = Math.floor((new Date() - new Date(fecha)) / 60000)
    if (minutos < 1) return "ahora"
    if (minutos < 60) return "hace " + minutos + " min"
    if (minutos < 1440) return "hace " + Math.floor(minutos / 60) + " h"
    return "hace " + Math.floor(minutos / 1440) + " d"
}

function Notificaciones() {
    const navigate = useNavigate()
    const [lista, setLista] = useState([])
    const [sinLeer, setSinLeer] = useState(0)
    const [abierto, setAbierto] = useState(false)

    const token = localStorage.getItem("token")
    const config = { headers: { Authorization: "Bearer " + token } }

    const cargar = async () => {
        try {
            const res = await axios.get(API, config)
            setLista(res.data.notificaciones)
            setSinLeer(res.data.sinLeer)
        } catch (err) {
            console.log("No se pudieron cargar las notificaciones", err)
        }
    }

    // Se revisa cada 5 segundos si llegó algo nuevo
    useEffect(() => {
        cargar()
        const intervalo = setInterval(cargar, 5000)
        return () => clearInterval(intervalo)
    }, [])

    const abrir = async () => {
        setAbierto(!abierto)
        if (!abierto && sinLeer > 0) {
            await axios.put(API + "/leidas", {}, config)
            setSinLeer(0)
        }
    }

    const ir = (n) => {
        setAbierto(false)
        if (n.link) navigate(n.link)
    }

    return (
        <div className="notif">
            <button className={abierto ? "notif-boton activo" : "notif-boton"} onClick={abrir} title="Notificaciones">
                🔔
                {sinLeer > 0 && <span className="notif-badge">{sinLeer > 9 ? "9+" : sinLeer}</span>}
            </button>

            {abierto && (
                <>
                    <div className="notif-fondo" onClick={() => setAbierto(false)} />
                    <div className="notif-panel">
                        <div className="notif-titulo">
                            <strong>Notificaciones</strong>
                            <span className="texto-suave">{lista.length} recientes</span>
                        </div>
                        <div className="notif-lista">
                            {lista.length === 0 && <p className="notif-vacio">No tenés notificaciones todavía 🎈</p>}
                            {lista.map((n) => (
                                <button key={n.id} className={n.leida ? "notif-item" : "notif-item nueva"} onClick={() => ir(n)}>
                                    <span className="notif-texto">{n.texto}</span>
                                    <span className="notif-hora">{hace(n.fecha)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Notificaciones
