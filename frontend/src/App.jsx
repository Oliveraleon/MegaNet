
import { useState, useEffect } from "react";
import { Route, Routes, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import Register from "./components/Register";
import Profile from "./components/Profile";
import ProfileEdit from "./components/profileEdit";
import Conexiones from "./components/Conexiones"
import SubirPosts from "./components/SubirPost"
import SideBar from "./components/SideBar";
import Buscador from "./components/buscador";
import PasswordChange from "./components/PasswordChange"
import RecuperarCuenta from "./components/RecuperarCuenta"
import ReiniciarContraseña from "./components/ReiniciarContraseña"
import PerfilUsuario from "./components/PerfilUsuario"
import Amigos from "./components/Amigos"
import Chat from "./components/Chat"
import Servidores from "./components/Servidores"
import PaginaComentarios from "./components/PaginaComentarios"
import { cerrarSesion, estaLogueado, getUsuario } from "./api/auth";

function App() {
    const navigate = useNavigate();
    const logueado = estaLogueado();
    const location = useLocation();
    const [user, setUser] = useState(getUsuario());

    useEffect(() => {
        setUser(getUsuario());
    }, [location.pathname]);

    const salir = () => {
        cerrarSesion();
        setUser(null);
        navigate("/login");
    }; 

    const esPaginaAuth =
        location.pathname === "/login" ||
        location.pathname === "/register" ||
        location.pathname === "/recuperarCuenta" ||
        location.pathname === "/reiniciarContraseña";

    return (
        <>
            {logueado && !esPaginaAuth && <SideBar />}
            <nav style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 2rem",
                background: "#ffffff",
                borderBottom: "1px solid #eaeaea",
                marginLeft: logueado && !esPaginaAuth ? "75px" : "0"
            }}>
                <Link to="/home">
                    <img
                        src="/MegaNet_logo.png"
                        alt="MegaNet Logo"
                        style={{ height: "40px" }}
                    />
                </Link>

                {logueado && !esPaginaAuth && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px"
                    }}>
                        <Link to="/amigos" style={{ textDecoration: "none", color: "#222", fontWeight: "600" }}>
                            Amigos
                        </Link>
                        <Link
                            to="/profile"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                textDecoration: "none",
                                color: "#222",
                                padding: "6px 12px",
                                borderRadius: "10px",
                                border: "1px solid #eaeaea"
                            }}
                        >
                            <img
                                src={user?.profilePicture ? `http://localhost:3000/${user.profilePicture}` : "/defaultProfile.png"}
                                alt="Foto de perfil"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    objectFit: "cover"
                                }}
                            />

                            <span style={{ fontWeight: "600" }}>
                                {user?.username || user?.email || "Mi perfil"}
                            </span>
                        </Link>

                                                <Link to="/chat" style={{ textDecoration: "none", color: "#222", fontWeight: "600" }}>
                            Chat
                        </Link>
                        <Link to="/servidores" style={{ textDecoration: "none", color: "#222", fontWeight: "600" }}>
                            Servidores
                        </Link>

                        <button
                            onClick={salir}
                            style={{
                                padding: "8px 14px",
                                border: 0,
                                borderRadius: 8,
                                background: "#007bff",
                                color: "#fff",
                                cursor: "pointer"
                            }}
                        >
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </nav>
            <div style={{marginLeft: logueado && !esPaginaAuth ? "75px" : "0"}}>
            <Routes>
                <Route path="/" element={<Navigate to="/register" />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/profileEdit" element={<ProfileEdit />} />
                <Route path="/conexiones" element={<Conexiones />} />
                <Route path="/conexiones/:id" element={<Conexiones />} />
                <Route path="/subirposts" element={<SubirPosts />}/>
                <Route path="/buscador" element={<Buscador />}/>
                <Route path="/passwordChange" element={<PasswordChange />}/>
                <Route path="/recuperarCuenta" element={<RecuperarCuenta />}/>
                <Route path="/reiniciarContrasena" element={<ReiniciarContraseña />}/>
                <Route path="/usuario/:id" element={<PerfilUsuario />} />
                <Route path="/amigos" element={<Amigos />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:id" element={<Chat />} />
                <Route path="/servidores" element={<Servidores />} />
                <Route path="/comentarios/:id" element={<PaginaComentarios />} />
            </Routes>
            </div>
        </>
    );
}

export default App;
