import "./Login.css"

function Login() {
    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Iniciar sesión</h2>
                <p className="login-subtitle">Ingresá tus datos para continuar</p>

                <form className="login-form">
                    <div className="input-group">
                        <label>Correo electrónico</label>
                        <input 
                            type="email" 
                            placeholder="Correo electrónico" 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            placeholder="Contraseña" 
                            required 
                        />
                    </div>

                    <button type="submit" className="btn-submit">Ingresar</button>
                </form>

                <div className="login-footer">
                    <p>¿No tenés una cuenta? <a href="/register">Registrate</a></p>
                </div>
            </div>
        </div>
    )
}

export default Login