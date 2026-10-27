
const jwt = require("jsonwebtoken");

const JWT_SECRET = "clave_secreta_meganet";

const verificarToken = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Tenés que iniciar sesión",
        });
    }

    const token = authorization.split(" ")[1];

    try {
        const usuario = jwt.verify(token, JWT_SECRET);

        req.usuario = usuario;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Token inválido o vencido",
        });
    }
};

module.exports = verificarToken;
