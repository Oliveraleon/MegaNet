import "./Register.css"

function Register() {
    return (
        <div className="register-layout">
            <div className="register-left">
                <div className="brand-content">
                    <h1>MegaNet</h1>
                    <p>Compartí lo que quieras y comunícate con quien sea</p>
                    <img 
                        src="Register1.jpg" 
                        alt="Comunidad MegaNet" 
                        className="register-image" 
                    />
                </div>
            </div>

            <div className="register-right">
                <div className="register-card">
                    <h2 className="register-title">Crear cuenta</h2>
                    <p className="register-subtitle">Ingresá tus datos para empezar</p>

                    <form className="register-form">
                        <div className="form-group">
                            <label>Nombre de usuario</label>
                            <input type="text" placeholder="Nombre de usuario" />
                        </div>

                        <div className="form-group">
                            <label>Correo electrónico</label>
                            <input type="email" placeholder="Correo electrónico" />
                        </div>

                        <div className="form-group">
                            <label>Contraseña</label>
                            <input type="password" placeholder="Contraseña" />
                        </div>

                        <button type="submit" className="register-button">Registrarse</button>
                    </form>

                    <div className="register-footer">
                        <p>¿Ya tenés una cuenta? <a href="/login">Iniciá sesión</a></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register