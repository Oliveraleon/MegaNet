import {useEffect, useState } from "react"
import { Navigate, useParams, useNavigate } from "react-router-dom"
import { estaLogueado } from "../api/auth"
import axios from "axios"
import FollowButton from "./FollowButton"
import "./Home.css"

function Conexiones() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tab, setTab] = useState("seguidores")
    const [seguidores, setSeguidores] = useState([])
    const [siguiendo, setSiguiendo] = useState([])
    const [seguidos, setSeguidos] = useState([])

    const cargar = async () => {
        const token = localStorage.getItem("token")
        const config = { headers: { Authorization: "Bearer " + token } }

        const urlSeguidores = id ? `http://localhost:3000/user/seguidores/${id}` : "http://localhost:3000/user/seguidores";
        const urlSiguiendo = id ? `http://localhost:3000/user/siguiendo/${id}` : "http://localhost:3000/user/siguiendo";
        const res1 = await axios.get(urlSeguidores, config)
        const res2 = await axios.get(urlSiguiendo, config)

        setSeguidores(res1.data.usuarios)
        setSiguiendo(res2.data.usuarios)
        setSeguidos(res2.data.seguidos)
    }

    useEffect(() => {
        if (estaLogueado()) {
        cargar()
        }
    }, [id])

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
                        <div className="post-author" onClick={() => navigate(`/profile/${u.id}`)} style={{ cursor: "pointer" }}>
                            <div className="avatar">
                                <img 
                                    src={u.profilePicture || "/defaultProfile.png"}
                                    alt={u.username}
                                    style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                                    onError={(e)=>{
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "/defaultProfile.png";
                                    }}
                                />
                                </div>
                            <strong>@{u.username}</strong>
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