
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
    cerrarSesion,
    getUsuario,
    estaLogueado,
} from "../api/auth";
import "./Home.css";

const API_URL = "http://localhost:3000";

function Home() {
    const navigate = useNavigate();
    const user = getUsuario();

    const [publicaciones, setPublicaciones] = useState([]);
    const [contenido, setContenido] = useState("");
    const [imagen, setImagen] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        if (estaLogueado()) {
            cargarPublicaciones();
        }
    }, []);

    if (!estaLogueado()) {
        return <Navigate to="/login" replace />;
    }

    function salir() {
        cerrarSesion();
        navigate("/login");
    }

    async function cargarPublicaciones() {
        setError("");

        try {
            const respuesta = await fetch(`${API_URL}/publicaciones`);
            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.message || "No se pudieron cargar las publicaciones"
                );
            }

            console.log("Publicaciones recibidas:", datos);
            setPublicaciones(datos);
        } catch (err) {
            console.error("Error al cargar publicaciones:", err);
            setError(
                err.message || "No se pudo conectar con el servidor"
            );
        } finally {
            setCargando(false);
        }
    }

    async function publicar(e) {
        e.preventDefault();
        setError("");
        setMensaje("");

        if (!contenido.trim() && !imagen) {
            setError("Escribí un texto o seleccioná una imagen.");
            return;
        }

        const formulario = new FormData();
        formulario.append("content", contenido);

        if (imagen) {
            formulario.append("imagen", imagen);
        }

        try {
            setEnviando(true);

            const respuesta = await fetch(`${API_URL}/publicaciones`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formulario,
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.message || "No se pudo crear la publicación"
                );
            }

            setContenido("");
            setImagen(null);
            e.target.reset();

            setMensaje("¡Publicación creada correctamente!");

            await cargarPublicaciones();
        } catch (err) {
            console.error("Error al publicar:", err);
            setError(err.message || "Error al crear la publicación");
        } finally {
            setEnviando(false);
        }
    }

    async function eliminarPublicacion(id) {
        const confirmar = window.confirm(
            "¿Querés desactivar esta publicación?"
        );

        if (!confirmar) return;

        setError("");
        setMensaje("");

        try {
            const respuesta = await fetch(
                `${API_URL}/publicaciones/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.message || "No se pudo desactivar la publicación"
                );
            }

            setPublicaciones((anteriores) =>
                anteriores.filter((post) => post.id !== id)
            );

            setMensaje("Publicación desactivada correctamente.");
        } catch (err) {
            console.error("Error al eliminar:", err);
            setError(
                err.message || "Error al desactivar la publicación"
            );
        }
    }

    return (
        <div className="home">
            <nav className="home-nav">
                <strong>MegaNet</strong>

                <button type="button" onClick={salir}>
                    Cerrar sesión
                </button>
            </nav>

            <main className="home-contenido">
                <h1>
                    Bienvenido/a, {user?.username || user?.email || "Usuario"}
                </h1>

                <section className="crear-publicacion">
                    <h2>¿Qué querés compartir?</h2>

                    <form onSubmit={publicar}>
                        <textarea
                            value={contenido}
                            onChange={(e) => setContenido(e.target.value)}
                            placeholder="Escribí una publicación..."
                            maxLength={255}
                        />

                        <label htmlFor="imagen">
                            Adjuntar imagen
                        </label>

                        <input
                            id="imagen"
                            name="imagen"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setImagen(e.target.files?.[0] || null)
                            }
                        />

                        {imagen && (
                            <p>
                                Imagen seleccionada: {imagen.name}
                            </p>
                        )}

                        <button type="submit" disabled={enviando}>
                            {enviando ? "Publicando..." : "Publicar"}
                        </button>
                    </form>
                </section>

                {error && (
                    <p className="error" role="alert">
                        {error}
                    </p>
                )}

                {mensaje && (
                    <p className="mensaje" role="status">
                        {mensaje}
                    </p>
                )}

                <section className="feed">
                    <h2>Publicaciones</h2>

                    {cargando ? (
                        <p>Cargando publicaciones...</p>
                    ) : publicaciones.length === 0 ? (
                        <p>
                            Todavía no hay publicaciones. ¡Compartí la primera!
                        </p>
                    ) : (
                        publicaciones.map((post) => (
                            <article
                                className="publicacion"
                                key={post.id}
                            >
                                <p className="autor">
                                    {post.autor?.perfil?.username ||
                                        post.autor?.email ||
                                        "Usuario"}
                                </p>

                                {post.content?.trim() && (
                                    <p>{post.content}</p>
                                )}

                                {post.multimedia && (
                                    <img
                                        className="publicacion-imagen"
                                        src={`${API_URL}/imagenes/${encodeURIComponent(post.multimedia)}`}
                                        alt="Imagen de la publicación"
                                    />
                                )}

                                <small>
                                    {post.creationDate
                                        ? new Date(
                                              post.creationDate
                                          ).toLocaleString("es-AR")
                                        : ""}
                                </small>

                                {Number(post.userId) ===
                                    Number(user?.id) && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            eliminarPublicacion(post.id)
                                        }
                                    >
                                        Eliminar publicación
                                    </button>
                                )}
                            </article>
                        ))
                    )}
                </section>
            </main>
        </div>
    );
}

export default Home;
