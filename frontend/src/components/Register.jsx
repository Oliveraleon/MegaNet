import "./Register.css"

function Register() {
    return (
        <div className="register-container">
            <div className="register-card">
                <h2>🚀 Unite a MegaNet</h2>
                <p className="subtitle">Crea tu cuenta para empezar a conectar</p>

                <form>
                    <div className="input-group">
                        <label>Nombre de usuario</label>
                        <input 
                            type="text" 
                            placeholder="Ej: JuanPerez" 
                            required 
                        />
                    </div>

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
                            placeholder="Mínimo 3 caracteres" 
                            required 
                        />
                    </div>

                    <button type="submit" className="btn-submit">Registrarse</button>
                </form>

                <div className="register-footer">
                    <p>¿Ya tenés una cuenta? <a href="/login">Iniciá sesión</a></p>
                </div>
            </div>
        </div>
    )
}

export default Register