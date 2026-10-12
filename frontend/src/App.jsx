import { Route, Routes, Link, Navigate } from "react-router-dom"
import Login from "./components/Login"
import Home from "./components/Home"
import Register from "./components/Register"

function App() {
  return (
    <>
      <div>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/home">Home</Link>
      </div>

      <Routes>
        {/* Redirige automáticamente la raíz al register */}
        <Route path="/" element={<Navigate to="/register" />} />
        
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </>
  )
}

export default App