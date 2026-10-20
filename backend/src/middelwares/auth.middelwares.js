const jwt = require('jsonwebtoken')

const auth = async (req, res, next) =>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({ message: "No se proporcionó un token de autenticación" });
    }
    try{
        const decoded = jwt.verify(token, "clave_secreta_meganet");
        req.user = decoded;
        next(); 
    }catch(error){
        res.status(403).json({ message: "Token de autenticación inválido", error: error.message });
    }
};

module.exports = auth;