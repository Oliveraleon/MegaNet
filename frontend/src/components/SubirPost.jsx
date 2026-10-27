import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { estaLogueado } from "../api/auth"
import "./Home.css"

function Postear(){
    const navigate = useNavigate()
    const logueado = estaLogueado()
    const [contenido, setContenido] = useState("")
    const [imagen, setImagen] = useState("")
    const [error, setError] = useState("")

    const publicar = async (e) => {
    e.preventDefault()
    try {
        setError("")
        const token = localStorage.getItem("token")
        const config = { headers: { Authorization: "Bearer " + token } }
        await axios.post("http://localhost:3000/user/publicaciones", { content: contenido, multimedia: imagen }, config)
        setContenido("")
        setImagen("")
        navigate("/home")
        cargar()
    } catch (err) {
        setError(err.response?.data?.message || "No se pudo publicar")
        }
    }

    return (
        <div className="home-container" style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h2>Crear nueva publicacion</h2>
            {error && <p className="home-error" style={{color: "red"}}>{error}</p>}
            <form className="post-form" onSubmit={publicar}>
                <textarea
                    placeholder="¿Que estas pensando?"
                    value={contenido}
                    maxLength={255}
                    onChange={(e)=>setContenido(e.target.value)}
                    required
                    />
                    <input
                        type="text"
                        placeholder="Link de una imagen(opcional)"
                        value={imagen}
                        onChange={(e)=>setImagen(e.target.value)}
                    />
                    <button type="submit">Publicar</button>
            </form>
            <br />
            <button onClick={()=>navigate("/home")} style={{background: "transparent", border: "none", cursor: "pointer", color: "blue"}}>
                Volver al inicio
            </button>
        </div>
    )
}

export default Postear