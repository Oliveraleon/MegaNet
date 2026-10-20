import { useState, useEffect } from "react"
import { obtenerPerfil, getUserPosts, estaLogueado } from "../api/auth"
import { useNavigate, useLocation } from "react-router-dom"
import "./Profile.css"

function Profile(){
    const [usuario, setUsuario] = useState(null)
    const [publicaciones, setPublicaciones] = useState([])
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if(!estaLogueado()){
            navigate("/login");
            return
        }
        async function cargarDatos(){
            try{
                const data = await obtenerPerfil()
                setUsuario(data.user);
                const postsData = await getUserPosts()
                setPublicaciones(postsData)
            }catch(error){
                console.error("No se pudo cargar el perfil",error)
            }
        }
        cargarDatos()
    }, [location])

    return(
        <div className="profile-layout"
        style={{
            backgroundImage: usuario?.profileBanner ? `url(${usuario.profileBanner})`:"none",
            backgroundColor: usuario?.profileBanner ? "transparent": "#f0f2f5"
        }}>
            <div className="main-container">
                <div className="profile-top">
                    <div className="profile-header-info">
                        <img
                            src={usuario?.profilePicture || "/defaultProfile.png"}
                            alt="Foto de perfil"
                            className="profile-avatar-container"
                            onError={(e)=>{
                                e.currentTarget.onError = null;
                                e.currentTarget.src = "/defaulProfile.png";
                            }}
                        />
                        <div className="profile-user-details">
                            <h2>{usuario?.username}</h2>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", marginTop: "8px" }}>
                                <div className="profile-stats" style={{ display: "flex", gap: "15px" }}>
                                    <span><strong>{usuario?.followers || 0}</strong> Seguidores</span>
                                    <span><strong>{usuario?.following || 0}</strong> Seguidos</span>
                                </div>
                                
                                <button
                                    onClick={()=> navigate("/conexiones")}
                                    style={{
                                        background: "#f8f9fa",
                                        border: "1px solid #ddd",
                                        padding: "6px 14px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "500",
                                        fontSize: "13px"
                                    }}
                                >
                                    Ver seguidores y seguidos
                                </button>
                            </div>
                        </div>
                    </div>

                    {usuario?.description && (
                    <p className="profile-description">
                        {usuario?.description}
                    </p>
                    )}

                    <button className="edit-profile-btn" onClick={() => navigate("/profileEdit")}>
                        Editar perfil
                    </button>
                </div>

                <div className="profile-bottom">
                    {publicaciones.length > 0 ? (
                        publicaciones.map((post) => (
                            <div key={post.id || post.id_publicacion} className="post-card">
                                <p>{post.content}</p>
                                {post.multimedia && (
                                    <img src={post.multimedia} alt="Multimedia" className="post-media" />
                                )}
                                <span className="post-date">
                                    {post.creationDate ? new Date(post.creationDate).toLocaleDateString():""}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p style={{textAlign: "center", color: "#666", padding: "20px"}}>
                            Aun no hay publicaciones
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile