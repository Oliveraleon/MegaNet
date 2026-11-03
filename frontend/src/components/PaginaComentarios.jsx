import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { obtenerComentarios, crearComentario, eliminarComentario } from "../api/auth";

function ComentariosPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [comentarios, setComentarios] = useState([]);
    const [texto, setTexto] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Estado para saber cuál menú de tres puntos está abierto
    const [menuAbiertoId, setMenuAbiertoId] = useState(null);
    
    // Estado para controlar la ventana de confirmación (modal)
    const [comentarioAEliminar, setComentarioAEliminar] = useState(null);

    const usuarioLogueado = JSON.parse(localStorage.getItem("user"));

    const cargarComentarios = async () => {
        try {
            const data = await obtenerComentarios(id);
            setComentarios(data);
        } catch (error) {
            console.error("Error al cargar comentarios:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarComentarios();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!texto.trim()) return;

        try {
            const respuesta = await crearComentario(id, texto);
            setComentarios([...comentarios, respuesta.comentario]);
            setTexto("");
        } catch (error) {
            console.error("Error al enviar comentario:", error);
        }
    };

    // Funciones para manejar la eliminación con el modal personalizado
    const iniciarEliminacion = (comentarioId) => {
        setComentarioAEliminar(comentarioId); // Abre el modal de confirmación
        setMenuAbiertoId(null); // Cierra el menú de puntos
    };

    const ejecutarEliminacion = async () => {
        if (!comentarioAEliminar) return;

        try {
            await eliminarComentario(id, comentarioAEliminar);
            // Filtramos el estado para que desaparezca al instante en tiempo real
            setComentarios(comentarios.filter(c => c.id !== comentarioAEliminar));
        } catch (error) {
            console.error("Error al eliminar comentario:", error);
        } finally {
            setComentarioAEliminar(null); // Cierra el modal pase lo que pase
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", position: "relative" }}>
            <button 
                onClick={() => navigate(-1)} 
                style={{ marginBottom: "20px", background: "#f0f2f5", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
            >
                ← Volver
            </button>

            <h2>Comentarios</h2>

            <div style={{ maxHeight: "400px", overflowY: "auto", margin: "20px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
                {loading ? (
                    <p>Cargando comentarios...</p>
                ) : comentarios.length > 0 ? (
                    comentarios.map((c) => {
                        // Verificamos si el comentario pertenece al usuario logueado
                        const esMio = usuarioLogueado && (c.userId === usuarioLogueado.id || c.autor?.id === usuarioLogueado.id);

                        return (
                            <div key={c.id} style={{ background: "#f8f9fa", padding: "12px", borderRadius: "8px", border: "1px solid #eee", display: "flex", gap: "12px", alignItems: "flex-start", position: "relative" }}>
                                
                                {/* 🟢 La foto de perfil AHORA APARECE PARA TODOS */}
                                <Link to={`/profile/${c.autor?.id}`}>
                                    <img
                                        src={c.autor?.profilePicture ? `http://localhost:3000/${c.autor.profilePicture}` : "/defaultProfile.png"}
                                        alt="Avatar"
                                        style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "/defaultProfile.png";
                                        }}
                                    />
                                </Link>

                                <div style={{ flex: 1 }}>
                                    <Link to={`/profile/${c.autor?.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                        <strong style={{ fontSize: "14px", color: "#333" }}>
                                            {c.autor?.username || "Usuario"}
                                        </strong>
                                    </Link>

                                    <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#555" }}>
                                        {c.text}
                                    </p>
                                </div>

                                {/* 🟢 El menú de tres puntos y opción de eliminar SOLO aparecen si es tuyo */}
                                {esMio && (
                                    <div style={{ position: "relative" }}>
                                        <button 
                                            onClick={() => setMenuAbiertoId(menuAbiertoId === c.id ? null : c.id)}
                                            style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px" }}
                                        >
                                            <img 
                                                src="/logoPuntos.png" 
                                                alt="Opciones" 
                                                style={{ width: "20px", height: "20px", objectFit: "contain" }} 
                                            />
                                        </button>

                                        {/* Menú desplegable flotante */}
                                        {menuAbiertoId === c.id && (
                                            <div style={{
                                                position: "absolute",
                                                right: 0,
                                                top: "25px",
                                                background: "white",
                                                border: "1px solid #ddd",
                                                borderRadius: "6px",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                zIndex: 10,
                                                width: "120px"
                                            }}>
                                                <button 
                                                    onClick={() => iniciarEliminacion(c.id)}
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
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        );
                    })
                ) : (
                    <p style={{ color: "#777", textAlign: "center" }}>Aún no hay comentarios. ¡Sé el primero en comentar!</p>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
                <input
                    type="text"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Escribe un comentario..."
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px" }}
                />
                <button 
                    type="submit"
                    style={{ background: "#0095f6", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                >
                    Publicar
                </button>
            </form>

            {/* --- VENTANA MODAL DE CONFIRMACIÓN PERSONALIZADA --- */}
            {comentarioAEliminar && (
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
                        <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>¿Eliminar comentario?</h3>
                        <p style={{ margin: "0 0 20px 0", color: "#666", fontSize: "14px" }}>
                            Esta acción no se puede deshacer.
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            <button 
                                onClick={() => setComentarioAEliminar(null)}
                                style={{
                                    padding: "8px 16px", background: "#f0f2f5", border: "none",
                                    borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#333"
                                }}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={ejecutarEliminacion}
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
    );
}

export default ComentariosPage;