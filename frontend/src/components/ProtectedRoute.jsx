import { Navigate } from "react-router-dom"
import { estaLogueado } from "../api/auth"

function ProtectedRoute({ children }) {
    return estaLogueado() ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute