import { useNavigate } from "react-router-dom"

// Muestra la foto de perfil de un usuario o, si no tiene, la primera letra de su nombre
const BASE = "http://localhost:3000/"

const fotoDe = (usuario) => {
    const foto = usuario?.profilePicture
    if (!foto) return null
    if (foto.startsWith("data:") || foto.startsWith("http")) return foto
    return BASE + foto
}

// Si se le pasa "perfil", al hacer click en la foto se abre el perfil de esa persona
function Avatar({ usuario, clase = "avatar-chat", perfil = false }) {
    const navigate = useNavigate()
    const foto = fotoDe(usuario)
    const abrirPerfil = perfil && usuario?.id ? () => navigate("/profile/" + usuario.id) : undefined
    const estilo = abrirPerfil ? { cursor: "pointer" } : undefined
    const titulo = abrirPerfil ? "Ver perfil de @" + usuario.username : undefined

    if (foto) {
        return <img className={clase + " con-foto"} src={foto} alt={usuario.username} onClick={abrirPerfil} style={estilo} title={titulo} />
    }
    return (
        <div className={clase} onClick={abrirPerfil} style={estilo} title={titulo}>
            {usuario?.username ? usuario.username[0].toUpperCase() : "?"}
        </div>
    )
}

export default Avatar