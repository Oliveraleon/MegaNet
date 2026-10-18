import "./Home.css"

import { useCallback, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { estaLogueado } from "../api/auth"
import { getSeguidores, getSiguiendo } from "../api/social"
import FollowButton from "./FollowButton"

function Conexiones() {
    const [tab, setTab] = useState("seguidores")
    const [seguidores, setSeguidores] = useState([])
    const [siguiendo, setSiguiendo] = useState([])
    const [error, setError] = useState("")

    const cargar = useCallback(async () => {
        if (!estaLogueado()) return
        try {
            setError("")
            const [a, b] = await Promise.all([getSeguidores(), getSiguiendo()])
            setSeguidores(a)
            setSiguiendo(b)
        } catch (err) {
            setError("No se pudieron cargar tus conexiones.")
        }
    }, [])

    useEffect(() => {
        cargar()
    }, [cargar])

    if (!estaLogueado()) return <Navigate to="/login" replace />

    const lista = tab === "seguidores" ? seguidores : siguiendo

    return (
        <div className="home-container">
            <div className="conexiones-box">
                <div className="tabs">
                    <button
                        className={tab === "seguidores" ? "tab active" : "tab"}
                        onClick={() => setTab("seguidores")}
                    >
                        {seguidores.length} seguidores
                    </button>
                    <button
                        className={tab === "siguiendo" ? "tab active" : "tab"}
                        onClick={() => setTab("siguiendo")}
                    >
                        {siguiendo.length} seguidos
                    </button>
                </div>

                {error && <p className="home-error">{error}</p>}

                {!error && lista.length === 0 && (
                    <p className="home-empty">
                        {tab === "seguidores" ? "Todavía nadie te sigue." : "Todavía no seguís a nadie."}
                    </p>
                )}

                {lista.map((u) => (
                    <div className="user-row" key={u.id}>
                        <div className="post-author">
                            <div className="avatar">
                                {u.profilePicture ? <img src={u.profilePicture} alt="" /> : u.username[0].toUpperCase()}
                            </div>
                            <strong>@{u.username}</strong>
                        </div>
                        <FollowButton
                            userId={u.id}
                            username={u.username}
                            siguiendoInicial={u.siguiendo}
                            onChange={cargar}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Conexiones