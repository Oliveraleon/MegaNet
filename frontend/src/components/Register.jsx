import "./Register.css"

function Register() {
    return (
        <div className="register-layout">
            {/* Lado izquierdo: Banner, ilustraciones o imágenes */}
            <div className="register-left">
                <div className="brand-content">
                    <h1>MegaNet</h1>
                    <p>Conectá con tu comunidad y compartí tus proyectos.</p>
                    {/* Podés cambiar esta URL por cualquier imagen que quieras */}
                    <img 
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80" 
                        alt="Comunidad MegaNet" 
                        className="register-image" 
                    />
                </div>
            </div>

            {/* Lado derecho: Tu caja de registro */}
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