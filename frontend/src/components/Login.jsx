import "./Register.css"
import "./Login.css"

function Login() {
    return (
        <div className="register-container login-container">
            <div className="neon-line"></div>

            <div className="register-card">
                <h2>👋 Bienvenido a MegaNet</h2>
                <p className="subtitle">Iniciá sesión para continuar</p>

                <form>
                    <div className="input-group">
                        <label>Correo electrónico</label>
                        <input 
                            type="email" 
                            placeholder="correo@ejemplo.com" 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            placeholder="Tu contraseña" 
                            required 
                        />
                    </div>

                    <button type="submit" className="btn-submit">Iniciar sesión</button>
                </form>

                <div className="register-footer">
                    <p>¿No tenés una cuenta? <a href="/register">Registrate</a></p>
                </div>
            </div>
        </div>
    )
}

export default Login