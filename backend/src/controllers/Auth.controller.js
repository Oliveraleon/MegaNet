const User = require("../models/usuarios.models.js");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const JWT_SECRET = "clave_secreta_meganet";

const register = async (req, res) => {
    try{
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({message: "Faltan datos requeridos"});
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ message: "El usuario ya esta registrado"});
    }
    const existingProfile = await User.findOne({where: {username}});
    if(existingProfile){
        return res.status(400).json({message: "El nombre de usuario no esta disponible"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "2h" }
    );
    res.status(201).json({ message: "Usuario registrado exitosamente",
        token,
        user: {
            id: user.id,
            email: user.email,
            username: username
        }
    });
    }catch(error){
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email o contraseña incorrectos" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email},
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.status(200).json({
            message: "Login exitoso",
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

module.exports = { 
    register,
    login
};