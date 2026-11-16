import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { estaLogueado } from "../api/auth"
import "./Home.css"

const API_URL = "http://localhost:3000"

function SubirPost() {
    const navigate = useNavigate()
    const [contenido, setContenido] = useState("")
    const [imagen, setImagen] = useState(null)
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState("")

    if (!estaLogueado()) {
        navigate("/login")
        return null
    }

    const publicar = async (e) => {
        e.preventDefault()
        setError("")

        if (!contenido.trim() && !imagen) {
            setError("Escribí un texto o seleccioná una imagen.")
            return
        }

        const formulario = new FormData()
        formulario.append("content", contenido)

        if (imagen) {
            formulario.append("imagen", imagen) 
        }

        try {
            setEnviando(true)
            const token = localStorage.getItem("token")

            await axios.post(`${API_URL}/posts/createPost`, formulario, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            setContenido("")
            setImagen(null)
            navigate("/home")
        } catch (err) {
            console.error("Error al publicar:", err)
            setError(err.response?.data?.message || err.message || "Error al crear la publicación")
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="home-container" style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h2>Crear nueva publicación</h2>
            {error && <p className="home-error" style={{ color: "red" }}>{error}</p>}
            
            <form className="post-form" onSubmit={publicar} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                <textarea
                    placeholder="¿Qué estás pensando?"
                    value={contenido}
                    maxLength={255}
                    onChange={(e) => setContenido(e.target.value)}
                    style={{ width: "100%", padding: "10px", minHeight: "100px" }}
                />

                <label htmlFor="imagen">Adjuntar imagen (opcional)</label>
                <input
                    id="imagen"
                    name="imagen"
                    type="file"
                    accept="image/*, video/*"
                    onChange={(e) => setImagen(e.target.files?.[0] || null)}
                />

                {imagen && <p style={{ fontSize: "14px", color: "#666" }}>Imagen seleccionada: {imagen.name}</p>}

                <button type="submit" disabled={enviando} style={{ padding: "10px", background: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                    {enviando ? "Publicando..." : "Publicar"}
                </button>
            </form>

            <br />
            <button onClick={() => navigate("/home")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "blue" }}>
                Volver al inicio
            </button>
        </div>
    )
}

export default SubirPost