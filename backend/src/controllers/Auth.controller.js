//const { Sequelize } = require("../config/db.js");
const User = require("../models/Usuarios.models.js");
const Profile = require("../models/Perfiles.models.js");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

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
    const existingProfile = await Profile.findOne({where: {username}});
    if(existingProfile){
        return res.status(400).json({message: "El nombre de usuario no esta disponible"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    await Profile.create({ username, userId: user.id });
    res.status(201).json({ message: "Usuario registrado exitosamente" });
    }catch(error){
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

module.exports = { register };