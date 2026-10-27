import { useState, useEffect } from "react"
import { getUserPosts, estaLogueado, dejarDeSeguir, seguirUsuario } from "../api/auth"
import { useNavigate, useParams } from "react-router-dom"
import "./Profile.css"
import FollowButton from "./FollowButton";

function Profile(){
    const { id } = useParams();
    const [perfil, setPerfil] = useState(null);
    const [publicaciones, setPublicaciones] = useState([]);
    const [loSigue, setLoSigue] = useState(false);
    const navigate = useNavigate();
    const usuarioLogueado = JSON.parse(localStorage.getItem("user"));
    const miPerfil = !id || (usuarioLogueado && Number(id) === Number(usuarioLogueado.id));

    useEffect(() => {
        if(!estaLogueado()){
            navigate("/login");
            return;
        }

        const cargarDatosPerfil = async () => {
            try {
                const token = localStorage.getItem("token");
                const url = miPerfil
                    ? "http://localhost:3000/user/profile" 
                    : `http://localhost:3000/user/${id}`;

                const resUser = await fetch(url, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const datos = await resUser.json();
                const usuarioData = datos.user || datos;
                setPerfil(usuarioData);

                if(!id){
                    const postData = await getUserPosts();
                    setPublicaciones(postData);
                }else{
                    const resPosts = await fetch(`http://localhost:3000/posts/user/${id}`,{
                        headers: {"Authorization": `Bearer ${token}`}
                    });
                    const postData = await resPosts.json();
                    setPublicaciones(postData);

                    const resSiguiendo = await fetch("http://localhost:3000/user/siguiendo",{
                        headers: {"Authorization": `Bearer ${token}`}
                    });
                    const datosSiguiendo = await resSiguiendo.json();
                    let estaSiguiendo = false;
                    for(let i = 0; i < datosSiguiendo.usuarios.length; i++){
                        if(Number(datosSiguiendo.usuarios[i].id)===Number(id)){
                            estaSiguiendo = true;
                            break;
                        }
                    }
                    setLoSigue(estaSiguiendo);
                }
            } catch (error) {
                console.log("Error al cargar el perfil:", error);
            }
        };
        cargarDatosPerfil();
    }, [id,navigate]);

    const botonSeguir = async ()=>{
        try{
            if(loSigue){
                await dejarDeSeguir(id);
                setLoSigue(false);
            }else{
                await seguirUsuario(id);
                setLoSigue(true);
            }
        }catch(error){
            console.error("Error al actualizar los seguidos", error);
        }
    };

    return(
        <div className="profile-layout"
        style={{
            backgroundImage: perfil?.profileBanner ? `url(${perfil.profileBanner})` : "none",
            backgroundColor: perfil?.profileBanner ? "transparent" : "#f0f2f5"
        }}>
            <div className="main-container">
                <div className="profile-top">
                    <div className="profile-header-info">
                        <img
                            src={perfil?.profilePicture || "/defaultProfile.png"}
                            alt="Foto de perfil"
                            className="profile-avatar-container"
                            onError={(e)=>{
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/defaultProfile.png";
                            }}
                        />
                        <div className="profile-user-details">
                            <h2>{perfil?.username}</h2>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", marginTop: "8px" }}>
                                <div className="profile-stats" style={{ display: "flex", gap: "15px" }}>
                                    <span><strong>{perfil?.followers || 0}</strong> Seguidores</span>
                                    <span><strong>{perfil?.following || 0}</strong> Seguidos</span>
                                </div>
                                
                                <button
                                    onClick={() => {
                                        if(id){
                                            navigate(`/conexiones/${id}`);
                                        }else{
                                            navigate("/conexiones");
                                        }
                                    }}
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

                    {perfil?.description && (
                    <p className="profile-description">
                        {perfil?.description}
                    </p>
                    )}

                {miPerfil ? (
                    <button className="edit-profile-btn" onClick={() => navigate("/profileEdit")}>
                        Editar perfil
                    </button>
                ) : (
                    <FollowButton
                        userId={id}
                        username={perfil?.username}
                        siguiendoInicial={loSigue}
                />
                )}
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
                                    {post.creationDate ? new Date(post.creationDate).toLocaleDateString() : ""}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p style={{textAlign: "center", color: "#666", padding: "20px"}}>
                            Aún no hay publicaciones
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile;