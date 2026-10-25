import "./Home.css"

import {useEffect, useState } from "react"
import { Navigate, Link } from "react-router-dom"
import { estaLogueado } from "../api/auth"
import axios from "axios"
import FollowButton from "./FollowButton"

function Conexiones() {
    const [tab, setTab] = useState("seguidores")
    const [seguidores, setSeguidores] = useState([])
    const [siguiendo, setSiguiendo] = useState([])
    const [seguidos, setSeguidos] = useState([])

    const cargar = async () => {
        const token = localStorage.getItem("token")
        const config = { headers: { Authorization: "Bearer " + token } }

        const res1 = await axios.get("http://localhost:3000/user/seguidores", config)
        const res2 = await axios.get("http://localhost:3000/user/siguiendo", config)

        setSeguidores(res1.data.usuarios)
        setSiguiendo(res2.data.usuarios)
        setSeguidos(res2.data.seguidos)
    }

    useEffect(() => {
        if (estaLogueado()) {
        cargar()
        }
    }, [])

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


                {lista.length === 0 && (
                    <p className="home-empty">
                        {tab === "seguidores" ? "Todavía nadie te sigue." : "Todavía no seguís a nadie."}
                    </p>
                )}

                {lista.map((u) => (
                    <div className="user-row" key={u.id}>
                        <div className="post-author">
                            <div className="avatar">
                                {u.username[0].toUpperCase()}</div>
                                    <Link to={"/usuario/" + u.id} className="autor-link">
                                <strong>@{u.username}</strong>
                            </Link>
                        </div>
                        <FollowButton
                            userId={u.id}
                            username={u.username}
                            siguiendoInicial={seguidos.includes(u.id)}
                            onChange={cargar}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Conexiones