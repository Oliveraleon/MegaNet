// Muestra la foto de perfil de un usuario o, si no tiene, la primera letra de su nombre
const BASE = "http://localhost:3000/"

const fotoDe = (usuario) => {
    const foto = usuario?.profilePicture
    if (!foto) return null
    if (foto.startsWith("data:") || foto.startsWith("http")) return foto
    return BASE + foto
}

function Avatar({ usuario, clase = "avatar-chat" }) {
    const foto = fotoDe(usuario)
    if (foto) {
        return <img className={clase + " con-foto"} src={foto} alt={usuario.username} />
    }
    return <div className={clase}>{usuario?.username ? usuario.username[0].toUpperCase() : "?"}</div>
}

export default Avatar
