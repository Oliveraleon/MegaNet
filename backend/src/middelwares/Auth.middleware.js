const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../controllers/Auth.controller.js");


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

const verificarRol = (req, res, next) => {
    if(!req.usuario){
        return res.status(401).json({message:"Tenes que iniciar sesion "})
    }
    if (req.usuario.rol !== "admin"){
        return res.status(403).json({message:"No tenes permisos para realizar esta accion"})
    }
    next();
}

module.exports = { 
    verificarToken, 
    tokenOpcional,
    verificarRol
    
 };