const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../controllers/Auth.controller.js");

const leerToken = (req) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return null;
    return header.split(" ")[1];
};

const verificarToken = (req, res, next) => {
    const header = req.headers.authorization;
     if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }
    try {
        const decoded = jwt.verify(header.split(" ")[1], JWT_SECRET);
        req.usuario = decoded;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};

const tokenOpcional = (req, res, next) => {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
        try {
            req.usuario = jwt.verify(header.split(" ")[1], JWT_SECRET);
        } catch (error) {
        }
    }
    next();
};

module.exports = { 
    verificarToken, 
    tokenOpcional };