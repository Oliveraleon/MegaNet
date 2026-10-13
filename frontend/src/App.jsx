import { Route, Routes, Link, Navigate } from "react-router-dom"
import Login from "./components/Login"
import Home from "./components/Home"
import Register from "./components/Register"

function App() {
  return (
    <>
      <nav style={{ padding: "1rem 2rem", background: "#ffffff", borderBottom: "1px solid #eaeaea" }}>
        <Link to="/home">
          <img src="/placeholder.png" alt="MegaNet Logo" style={{ height: "40px" }} />
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </>
  )
}

export default App