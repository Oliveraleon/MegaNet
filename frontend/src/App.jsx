import { Route, Routes, Link, Navigate, useNavigate, useLocation  } from "react-router-dom"
import Login from "./components/Login"
import Home from "./components/Home"
import Register from "./components/Register"
import Conexiones from "./components/Conexiones"
import { cerrarSesion, estaLogueado } from "./api/auth"

function App() {
  const navigate = useNavigate()
  const logueado = estaLogueado()
  const location = useLocation()

  const salir = () => {
    cerrarSesion()
    navigate("/login")
  }
  const esPaginaAuth = location.pathname === "/login" || location.pathname === "/register"
  return (
    <>
      <nav style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "1rem 2rem", 
        background: "#ffffff", 
        borderBottom: "1px solid #eaeaea" 
        }}>
        <Link to="/home">
          <img src="/MegaNet_logo.png" alt="MegaNet Logo" style={{ height: "40px" }} />
        </Link>
        {logueado && !esPaginaAuth && (
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
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/conexiones" element={<Conexiones />} />
      </Routes>
    </>
  )
}

export default App