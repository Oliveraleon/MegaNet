import { useState, useEffect } from "react"
import { getUsuario, getUserPosts, estaLogueado, dejarDeSeguir, seguirUsuario, darLike, quitarLike, esAdmin } from "../api/auth"
import { useNavigate, useParams, Link } from "react-router-dom"
import axios from "axios"
import "./Profile.css"
import FollowButton from "./FollowButton";

function Profile(){
    const { id } = useParams();
    const navigate = useNavigate();
    const usuarioLogueado = JSON.parse(localStorage.getItem("user"));
    const [perfil, setPerfil] = useState(null);
    const [publicaciones, setPublicaciones] = useState([]);
    const [loSigue, setLoSigue] = useState(false);
    const [seguidores, setSeguidores] = useState([])
    const [siguiendo, setSiguiendo] = useState([])
    const [seguidos, setSeguidos] = useState([])
    const [datos, setDatos] = useState(null)
    const [cambioLike, setCambioLike] = useState({});
    const [error, setError] = useState("")
    const [menuPostAbiertoId, setMenuPostAbiertoId] = useState(null);
    const [postAEliminar, setPostAEliminar] = useState(null);

    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: "Bearer " + token } }
    const miPerfil = !id || (usuarioLogueado && Number(id) === Number(usuarioLogueado.id));

    const enviarSolicitud = async () => {
        try {
            await axios.post("http://localhost:3000/user/amistad/" + id, {}, config)
            cargarDatosPerfil()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo enviar la solicitud")
        }
    }

    const aceptarSolicitud = async () => {
        try {
            await axios.post("http://localhost:3000/user/amistad/" + id + "/aceptar", {}, config)
            cargarDatosPerfil()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo aceptar la solicitud")
        }
    }

    const eliminarAmistad = async () => {
        if (datos?.amistad === "amigos" && !confirm("¿Querés eliminar a @" + datos.usuario.username + " de tus amigos?")) {
            return
        }
        try {
            await axios.delete("http://localhost:3000/user/amistad/" + id, config)
            cargarDatosPerfil()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo completar la accion")
        }
    }

    const cargarDatosPerfil = async () => {
        try {
            setError("")
            const idValido = id && id !== "undefined" ? id : null;
            const urlSeguidores = idValido ? `http://localhost:3000/user/seguidores/${idValido}` : "http://localhost:3000/user/seguidores";
            const urlSiguiendo = idValido ? `http://localhost:3000/user/siguiendo/${idValido}` : "http://localhost:3000/user/siguiendo";
            const res1 = await axios.get(urlSeguidores, config)
            const res2 = await axios.get(urlSiguiendo, config)

            setSeguidores(res1.data.usuarios)
            setSiguiendo(res2.data.usuarios)
            setSeguidos(res2.data.seguidos)

            if (idValido) {
                try {
                    const resPerfilUsuario = await axios.get("http://localhost:3000/user/perfil/" + idValido, config)
                    setDatos(resPerfilUsuario.data)
                } catch (e) {
                    console.log("Error al cargar datos de amistad:", e);
                }
            } else {
                setDatos(null);
            }

            const url = !idValido   
                ? "http://localhost:3000/user/profile" 
                : `http://localhost:3000/user/${idValido}`;

            const resUser = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const datosUser = await resUser.json();
            const usuarioData = datosUser.user || datosUser;
            setPerfil(usuarioData);

            let postData = [];
            if(!idValido){
                postData = await getUserPosts();
            }else{
                const resPosts = await fetch(`http://localhost:3000/posts/user/${idValido}`,{
                    headers: {"Authorization": `Bearer ${token}`}
                });
                postData = await resPosts.json();

                const resSiguiendo = await fetch("http://localhost:3000/user/siguiendo",{
                    headers: {"Authorization": `Bearer ${token}`}
                });
                const datosSiguiendo = await resSiguiendo.json();
                let estaSiguiendo = false;
                for(let i = 0; i < datosSiguiendo.usuarios.length; i++){
                    if(Number(datosSiguiendo.usuarios[i].id)===Number(idValido)){
                        estaSiguiendo = true;
                        break;
                    }
                }
                setLoSigue(estaSiguiendo);
            }

            setPublicaciones(postData);

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
                {error && <p className="home-error">{error}</p>}
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
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <h2>{perfil?.username}</h2>    
                                {datos?.amistad === "amigos" && <span className="etiqueta amigos">Amigos</span>}
                                {datos?.meSigue && <span className="etiqueta">Te sigue</span>}
                            </div>
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
                    <div className="perfil-actions" style={{ display: "flex", gap: "10px", marginTop: "15px", flexWrap: "wrap" }}>
                        <FollowButton
                            userId={id}
                            username={perfil?.username}
                            siguiendoInicial={loSigue}
                            onChange={cargarDatosPerfil}
                        />

                        {datos?.amistad === "ninguna" && (
                            <button className="small-btn" onClick={enviarSolicitud}>Agregar amigo</button>
                        )}
                        {datos?.amistad === "enviada" && (
                            <button className="small-btn" onClick={eliminarAmistad}>Cancelar solicitud</button>
                        )}
                        {datos?.amistad === "recibida" && (
                            <>
                                <button className="small-btn" onClick={aceptarSolicitud}>Aceptar solicitud</button>
                                <button className="small-btn danger" onClick={eliminarAmistad}>Rechazar</button>
                            </>
                        )}
                        {datos?.amistad === "amigos" && (
                            <button className="small-btn" onClick={eliminarAmistad}>Amigos ✓</button>
                        )}
                        {(datos?.amistad === "amigos" || (loSigue && datos?.meSigue)) && (
                            <Link to={"/chat/" + perfil?.id} className="small-btn">Mensaje</Link>
                        )}
                    </div>
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
                                        <Link to={autorId ? `/profile/${autorId}` : "/profile"} className="post-header-link" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
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