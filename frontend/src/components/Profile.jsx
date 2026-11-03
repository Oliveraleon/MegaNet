import { useState, useEffect } from "react"
import { getUserPosts, estaLogueado, dejarDeSeguir, seguirUsuario, darLike, quitarLike, esAdmin } from "../api/auth"
import { useNavigate, useParams, Link } from "react-router-dom"
import axios from "axios"
import "./Profile.css"
import FollowButton from "./FollowButton";

function Profile(){
    const { id } = useParams();
    const [perfil, setPerfil] = useState(null);
    const [publicaciones, setPublicaciones] = useState([]);
    const [loSigue, setLoSigue] = useState(false);
    const [seguidores, setSeguidores] = useState([])
    const [siguiendo, setSiguiendo] = useState([])
    const [seguidos, setSeguidos] = useState([])
    const [cambioLike, setCambioLike] = useState({});

    // Estados para el menú de opciones del post y el modal de confirmación
    const [menuPostAbiertoId, setMenuPostAbiertoId] = useState(null);
    const [postAEliminar, setPostAEliminar] = useState(null);

    const navigate = useNavigate();
    const usuarioLogueado = JSON.parse(localStorage.getItem("user"));
    const miPerfil = !id || (usuarioLogueado && Number(id) === Number(usuarioLogueado.id));

    const cargarDatosPerfil = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: "Bearer " + token } }
            const urlSeguidores = id ? `http://localhost:3000/user/seguidores/${id}` : "http://localhost:3000/user/seguidores";
            const urlSiguiendo = id ? `http://localhost:3000/user/siguiendo/${id}` : "http://localhost:3000/user/siguiendo";
            const res1 = await axios.get(urlSeguidores, config)
            const res2 = await axios.get(urlSiguiendo, config)

            setSeguidores(res1.data.usuarios)
            setSiguiendo(res2.data.usuarios)
            setSeguidos(res2.data.seguidos)
            const url = miPerfil
                ? "http://localhost:3000/user/profile" 
                : `http://localhost:3000/user/${id}`;

            const resUser = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const datos = await resUser.json();
            const usuarioData = datos.user || datos;
            setPerfil(usuarioData);

            let postData = [];
            if(!id){
                postData = await getUserPosts();
            }else{
                const resPosts = await fetch(`http://localhost:3000/posts/user/${id}`,{
                    headers: {"Authorization": `Bearer ${token}`}
                });
                postData = await resPosts.json();

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

            setPublicaciones(postData);

            // Sincronizamos los likes iniciales desde el backend
            const estadoLikes = {};
            postData.forEach(p => {
                const postId = p.id || p.id_publicacion;
                estadoLikes[postId] = p.liked;
            });
            setCambioLike(estadoLikes);

        } catch (error) {
            console.log("Error al cargar el perfil:", error);
        }
    };

    useEffect(() => {
        if(!estaLogueado()){
            navigate("/login");
            return;
        }
        cargarDatosPerfil();
    }, [id, navigate]);

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

    // Funciones para eliminar la publicación con confirmación
    const iniciarEliminacionPost = (postId) => {
        setPostAEliminar(postId);
        setMenuPostAbiertoId(null);
    };

    const ejecutarEliminacionPost = async () => {
        if (!postAEliminar) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3000/auth/publicaciones/${postAEliminar}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error al eliminar la publicación");

            // Actualizamos el estado para remover el post al instante
            setPublicaciones(publicaciones.filter(p => (p.id || p.id_publicacion) !== postAEliminar));
        } catch (error) {
            console.error("Error al eliminar el post:", error);
        } finally {
            setPostAEliminar(null);
        }
    };

    return(
        <div className="profile-layout"
        style={{
            backgroundImage: perfil?.profileBanner ? `url(http://localhost:3000/${perfil.profileBanner})` : "none",
            backgroundColor: perfil?.profileBanner ? "transparent" : "#f0f2f5"
        }}>
            <div className="main-container">
                <div className="profile-top">
                    
                    <div className="profile-header-info">
                        <img
                            src={perfil?.profilePicture ? `http://localhost:3000/${perfil.profilePicture}` : "/defaultProfile.png"}
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
                                    <span><strong>{seguidores.length}</strong> Seguidores</span>
                                    <span><strong>{siguiendo.length}</strong> Seguidos</span>
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
                        onChange={cargarDatosPerfil}
                />
                )}
                </div>

                <div className="profile-bottom">
                    {publicaciones.length > 0 ? (
                        publicaciones.map((post) => {
                            const postId = post.id || post.id_publicacion;
                            const autorId = post.userId || perfil?.id;
                            const esMiPost = usuarioLogueado && Number(autorId) === Number(usuarioLogueado?.id);
                            const puedeBorrar = esMiPost || esAdmin();

                            return (
                                <div key={postId} className="post-card">
                                    <div className="post-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Link to={`/profile/${autorId}`} className="post-header-link" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
                                            <img
                                                src={perfil?.profilePicture ? `http://localhost:3000/${perfil.profilePicture}` : "/defaultProfile.png"}
                                                alt="Foto de perfil"
                                                className="post-avatar"
                                                onError={(e)=>{
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = "/defaultProfile.png";
                                                }}
                                            />
                                            <div className="post-user-info" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <span className="post-username">{perfil?.username || "Usuario"}</span>
                                                <span className="post-date">
                                                    {post.creationDate ? new Date(post.creationDate).toLocaleDateString() : ""}
                                                </span>
                                            </div>
                                        </Link>

                                        {puedeBorrar && (
                                            <div style={{ position: "relative" }}>
                                                <button 
                                                    onClick={() => setMenuPostAbiertoId(menuPostAbiertoId === postId ? null : postId)}
                                                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px" }}
                                                >
                                                    <img 
                                                        src="/logoPuntos.png" 
                                                        alt="Opciones" 
                                                        style={{ width: "20px", height: "20px", objectFit: "contain" }} 
                                                    />
                                                </button>

                                                {menuPostAbiertoId === postId && (
                                                    <div style={{
                                                        position: "absolute",
                                                        right: 0,
                                                        top: "25px",
                                                        background: "white",
                                                        border: "1px solid #ddd",
                                                        borderRadius: "6px",
                                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                        zIndex: 10,
                                                        width: "130px"
                                                    }}>
                                                        <button 
                                                            onClick={() => iniciarEliminacionPost(postId)}
                                                            style={{
                                                                width: "100%",
                                                                padding: "8px 12px",
                                                                background: "transparent",
                                                                border: "none",
                                                                textAlign: "left",
                                                                color: "#ff3b30",
                                                                cursor: "pointer",
                                                                fontSize: "13px",
                                                                fontWeight: "600"
                                                            }}
                                                        >
                                                            Eliminar post
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {post.content && <p className="post-text">{post.content}</p>}
                                    {post.multimedia && (
                                        <div className="post-media-container">
                                            {post.multimedia.endsWith(".mp4") || post.multimedia.endsWith(".mov") ? (
                                            <video controls src={`http://localhost:3000/${post.multimedia}`} className="post-media" />
                                        ) : (
                                            <img src={`http://localhost:3000/${post.multimedia}`} alt="Multimedia" className="post-media" />
                                        )}
                                        </div>
                                    )}

                                    <div className="post-actions">
                                        <button className="action-btn"
                                            type="button" 
                                            onClick={async () => {
                                                const yaDioLike = cambioLike[postId];

                                                try {
                                                    let data;
                                                    if (yaDioLike) {
                                                        data = await quitarLike(postId);
                                                    } else {
                                                        data = await darLike(postId);
                                                    }

                                                    setCambioLike({ ...cambioLike, [postId]: !yaDioLike });

                                                    setPublicaciones(publicaciones.map(p => {
                                                        const idActual = p.id || p.id_publicacion;
                                                        if (idActual === postId) {
                                                            return {
                                                                ...p,
                                                                likes: data.likes
                                                            };
                                                        }
                                                        return p;
                                                    }));
                                                } catch (error) {
                                                    console.error("Error al actualizar el like:", error);
                                                }
                                            }}
                                            style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", cursor: "pointer" }} 
                                        >
                                            <img
                                                src={cambioLike[postId] ? "/logoCorazonLleno.png" : "/logoCorazonVacio.png"}
                                                alt="Me gusta"
                                                style={{ width: "20px", height: "20px", objectFit: "contain" }}
                                            />
                                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>
                                                {post.likes || 0}
                                            </span>
                                        </button>
                                        
                                        <button 
                                        className="action-btn"
                                        onClick={()=>navigate(`/comentarios/${postId}`)} 
                                        style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", cursor: "pointer" }}>
                                            <img
                                                src="/logoComentario.png"
                                                alt="Comentar"
                                                style={{ width: "20px", height: "20px", objectFit: "contain" }}
                                            />
                                            <span style ={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>
                                                {post.cantidadComentarios || 0}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <p style={{textAlign: "center", color: "#666", padding: "20px"}}>
                            Aún no hay publicaciones
                        </p>
                    )}
                </div>
            </div>

            {/* --- VENTANA MODAL DE CONFIRMACIÓN PARA EL POST --- */}
            {postAEliminar && (
                <div style={{
                    position: "fixed",
                    top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        background: "white", padding: "20px 24px", borderRadius: "12px",
                        width: "320px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                    }}>
                        <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>¿Eliminar publicación?</h3>
                        <p style={{ margin: "0 0 20px 0", color: "#666", fontSize: "14px" }}>
                            Esta acción no se puede deshacer y borrará también sus comentarios y likes.
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            <button 
                                onClick={() => setPostAEliminar(null)}
                                style={{
                                    padding: "8px 16px", background: "#f0f2f5", border: "none",
                                    borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#333"
                                }}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={ejecutarEliminacionPost}
                                style={{
                                    padding: "8px 16px", background: "#ff3b30", border: "none",
                                    borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "white"
                                }}
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profile;