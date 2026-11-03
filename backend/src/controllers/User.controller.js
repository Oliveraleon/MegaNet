const { Op } = require("sequelize");
const User = require("../models/Usuarios.models.js");
const Publicaciones = require("../models/Publicaciones.models.js");
const Seguidores = require("../models/Seguidores.models.js");
const Amistades = require("../models/Amistades.models.js");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { agregarDatos } = require("./Auth.controller.js");
const { obtenerSeguidos, obtenerSeguidoresIds, obtenerAmigos, buscarAmistad, agregarRelacion } = require("../utilities/utilidades.js");
    
const JWT_SECRET = "clave_secreta_meganet";


const obtenerPerfil = async (req, res)=> {
    try{
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password']}
        });
        if(!user){
            return res.status(404).json({ message: "Usuario no encontrado"});
        }
        res.json({user});
    }catch(error){
        res.status(500).json({ message: 'Error al obtener el perfil', error: error.message });
    }
};

const actualizarPerfil = async (req, res) => {
    try {
        const userId = req.user.id;
        const {username,description,profilePicture,profileBanner} = req.body;
        const user = await User.findByPk(userId);
        if (!user){
            return res.status(404).json({message: "Usuario no encontrado"});
        }
        if (username !== undefined) {
            const usernameLimpio = username.trim();
            if (!usernameLimpio) {return res.status(400).json({message: "El nombre de usuario no puede estar vacío"});
            }
            user.username = usernameLimpio;
        }
        if (description !== undefined) {
            user.description = description;
        }
        if (profilePicture !== undefined) {
            user.profilePicture = profilePicture;
        }
        if (profileBanner !== undefined) {
            user.profileBanner = profileBanner;
        }
        await user.save();
        return res.status(200).json({
            message: "Perfil actualizado con éxito",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                description: user.description,
                profilePicture: user.profilePicture,
                profileBanner: user.profileBanner,
                followers: user.followers,
                following: user.following
            }
        });

    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                message: "Ese nombre de usuario ya está en uso"
            });
        }
        return res.status(500).json({
            message: "Error al actualizar el perfil",
            error: error.message
        });
    }
};


const getFeed = async (req, res) => {
    try {
        const incluirAutor = [{ model: User, as: "autor", attributes: ["id", "username", "profilePicture"] }];

        if (!req.usuario) {
            const posts = await Publicaciones.findAll({
                where: { privacy: "public" },
                include: incluirAutor,
                order: [["creationDate", "DESC"]],
            });
                        return res.status(200).json({ tipo: "invitado", posts: await agregarDatos(posts, null) });
        }

               
        const seguidos = await obtenerSeguidos(req.usuario.id);
        const seguidores = await obtenerSeguidoresIds(req.usuario.id);
        const amigos = await obtenerAmigos(req.usuario.id);

        const ids = [req.usuario.id];
        for (let i = 0; i < seguidos.length; i++) {
            ids.push(seguidos[i]);
        }
        for (let i = 0; i < seguidores.length; i++) {
            ids.push(seguidores[i]);
        }
        for (let i = 0; i < amigos.length; i++) {
            ids.push(amigos[i]);
        }

        const posts = await Publicaciones.findAll({
            where: { userId: ids, privacy: ["public", "friends"] },
            include: incluirAutor,
            order: [["creationDate", "DESC"]],
        });
        const lista = await agregarDatos(posts, req.usuario.id);
        res.status(200).json({ tipo: "registrado", posts: agregarRelacion(lista, seguidos, seguidores, amigos) });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el feed", error: error.message });
    }
};

const getUsuarios = async (req, res) => {
    try {
        const todos = await User.findAll({ attributes: ["id", "username", "profilePicture"] });
        const usuarios = [];
        
        for (let i = 0; i < todos.length; i++) {
            if (todos[i].id !== req.usuario.id) {
                usuarios.push(todos[i]);
            }
        }
        
        const seguidos = await obtenerSeguidos(req.usuario.id);
        res.status(200).json({ usuarios, seguidos });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios"});
    }
};

const seguir = async (req, res) => {
    try {
        const otroId = Number(req.params.id);
        if (otroId === req.usuario.id) {
            return res.status(400).json({ message: "No podes seguirte a vos mismo" });
        }

        const otroUsuario = await User.findByPk(otroId);
        if (!otroUsuario) {
            return res.status(404).json({ message: "El usuario no existe" });
        }

        const yaLoSigue = await Seguidores.findOne({
            where: { followerId: req.usuario.id, followedId: otroId },
        });
        if (!yaLoSigue) {
            await Seguidores.create({ followerId: req.usuario.id, followedId: otroId });
        }
        res.status(201).json({ message: "Ahora seguis a " + otroUsuario.username });
    } catch (error) {
        res.status(500).json({ message: "Error al seguir"});
    }
};

const dejarDeSeguir = async (req, res) => {
    try {
        const otroId = Number(req.params.id);
        await Seguidores.destroy({
            where: { followerId: req.usuario.id, followedId: otroId },
        });
        res.status(200).json({ message: "Dejaste de seguir al usuario" });
    } catch (error) {
        res.status(500).json({ message: "Error al dejar de seguir"});
    }
};

const getSeguidores = async (req, res) => {
    try {
        const targetUserId = req.params.id || req.usuario.id;
        const relaciones = await Seguidores.findAll({ where: { followedId: targetUserId } });
        const ids = [];
        
        for (let i = 0; i < relaciones.length; i++) {
            ids.push(relaciones[i].followerId);
        }
        
        const usuarios = await User.findAll({
            where: { id: ids },
            attributes: ["id", "username", "profilePicture"],
        });
        const seguidos = await obtenerSeguidos(req.usuario.id);
        res.status(200).json({ usuarios, seguidos });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener seguidores"});
    }
};

const getSiguiendo = async (req, res) => {
    try {
        const targetUserId = req.params.id || req.usuario.id;
        const seguidos = await obtenerSeguidos(targetUserId);
        const usuarios = await User.findAll({
            where: { id: seguidos },
            attributes: ["id", "username", "profilePicture"],
        });
        res.status(200).json({ usuarios, seguidos });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener seguidos", error: error.message });
    }
};

const buscarUser = async (req,res)=>{
    try{
        const termino = req.query.q;
        if(!termino){
            return res.status(200).json([])
        }
        const usuariosEncontrados = await User.findAll({
            where:{
                username:{
                    [Op.like]: `%${termino}%`
                },
                id:{
                    [Op.ne]: req.user.id
                }
            },
            attributes: ["id","username","profilePicture"]
        });
        res.status(200).json(usuariosEncontrados)
    }catch(error){
        res.status(500).json({message:"Error al buscar usuarios", error:error.message});
    }
}

const obtenerUserPorId = async (req,res) =>{
    try{
        const { id } = req.params;
        const user = await User.findByPk(id,{
            attributes: {exclude: ["password"]}
        });
        if(!user){
            return res.status(404).json({message:"Usuario no encontrado"})
        }
        res.status(200).json({user});
    }catch(error){
        res.status(500).json({message:"Error al obtener al usuario", error:error.message})
    }
};


const actualizarContraseña = async (req,res)=>{
    try{
        const userId = req.user.id;
        const {passwordActual, nuevaPassword} = req.body;
        const user = await User.findByPk(userId);
        if(!user){
            return res.status(404).json({message:"Usuario no encontrado"});
        }
        const validPassword = await bcrypt.compare(passwordActual, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: "La contraseña actual es incorrecta" });
            }
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        user.password = hashedPassword
        await user.save();
        res.json({message: "Contraseña actualizada"})
    }catch(error){
        console.error("Error al cambiar contraseña:", error);
        res.status(500).json({ message: "Error al cambiar la contraseña" });
    }
}

const eliminarCuenta = async (req,res)=>{
    try{
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if(!user){
            return res.status(404).json({message:"Usuario no encontrado"})
        }
        await Publicaciones.destroy({ where: { userId: userId } });
        await Seguidores.destroy({
            where:{
                [Op.or]:[
                    {followerId: userId},
                    {followedId: userId}
                ]
            }
        });
        await user.destroy()
        res.status(200).json({ message: "Cuenta eliminada correctamente" });
    }catch(error){
        console.error("Error al eliminar la cuenta:", error);
        res.status(500).json({ message: "Error al eliminar la cuenta" });
    }
}

const recuperarCuenta = async (req,res)=>{
    try{
        const {email} = req.body;
        const user = await User.findOne({where:{email}})
        if(!user){
            return res.status(404).json({message:"Usuario no encontrado"})
        }
        const token = jwt.sign(
             { id: user.id, email: user.email },
             JWT_SECRET,
             { expiresIn: "2h" }
        )
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const linkRecuperacion = `http://localhost:5173/reiniciarContrasena?token=${token}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Recuperación de contraseña - MegaNet",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>¿Olvidaste tu contraseña?</h2>
                <p>Has solicitado restablecer tu contraseña para tu cuenta.</p>
                <p>Haz clic en el siguiente botón para crear una nueva (este enlace expira en 2 horas):</p>
                <a href="${linkRecuperacion}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Restablecer contraseña</a>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">Si tú no solicitaste esto, puedes ignorar este mensaje.</p>
                </div>
            `
        });
        return res.status(200).json({ message: "Correo de recuperación enviado con éxito" });
    }catch(error){
        console.error("Error al recuperar cuenta:", error);
        res.status(500).json({ message: "Error al procesar la recuperación" });
    }
}

const reiniciarContraseña = async (req,res)=>{
    try{
        const { token, nuevaPassword } = req.body;
        if(!token || !nuevaPassword){
            return res.status(400).json({ message: "Faltan datos obligatorios" });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if(!user){
            return res.status(404).json({message:"Usuario no encontrado"})
        }
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: "Contraseña restablecida con éxito" });
    }catch(error){
        console.error("Error al restablecer contraseña:", error);
        return res.status(400).json({ message: "El enlace es inválido o ha expirado" });
    }
}
// ---------- Ver a otro usuario, amigos y solicitudes de amistad ----------

const verPerfil = async (req, res) => {
    try {
        const otroId = Number(req.params.id);
        const usuario = await User.findByPk(otroId, {
            attributes: ["id", "username", "description", "profilePicture", "profileBanner"],
        });
        if (!usuario) {
            return res.status(404).json({ message: "El usuario no existe" });
        }

        // Relacion de seguimiento
        const misSeguidos = await obtenerSeguidos(req.usuario.id);
        const misSeguidores = await obtenerSeguidoresIds(req.usuario.id);
        const susSeguidos = await obtenerSeguidos(otroId);
        const susSeguidores = await obtenerSeguidoresIds(otroId);

        // Relacion de amistad: ninguna, enviada, recibida o amigos
        let amistad = "ninguna";
        const relacion = await buscarAmistad(req.usuario.id, otroId);
        if (relacion) {
            if (relacion.status === "aceptada") {
                amistad = "amigos";
            } else if (relacion.senderId === req.usuario.id) {
                amistad = "enviada";
            } else {
                amistad = "recibida";
            }
        }

        // Los amigos tambien ven las publicaciones con privacidad "friends"
        const privacidad = ["public"];
        if (amistad === "amigos") {
            privacidad.push("friends");
        }
        const publicaciones = await Publicaciones.findAll({
            where: { userId: otroId, privacy: privacidad },
            order: [["creationDate", "DESC"]],
        });

        res.status(200).json({
            usuario,
            loSigo: misSeguidos.includes(otroId),
            meSigue: misSeguidores.includes(otroId),
            seguidores: susSeguidores.length,
            seguidos: susSeguidos.length,
            amistad,
            publicaciones,
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el perfil", error: error.message });
    }
};

const enviarSolicitud = async (req, res) => {
    try {
        const otroId = Number(req.params.id);
        if (otroId === req.usuario.id) {
            return res.status(400).json({ message: "No podes enviarte una solicitud a vos mismo" });
        }

        const otroUsuario = await User.findByPk(otroId);
        if (!otroUsuario) {
            return res.status(404).json({ message: "El usuario no existe" });
        }

        const existente = await buscarAmistad(req.usuario.id, otroId);
        if (existente) {
            if (existente.status === "aceptada") {
                return res.status(400).json({ message: "Ya son amigos" });
            }
            if (existente.senderId === req.usuario.id) {
                return res.status(400).json({ message: "Ya le enviaste una solicitud" });
            }
            return res.status(400).json({ message: "Esa persona ya te envio una solicitud, aceptala" });
        }

        await Amistades.create({ senderId: req.usuario.id, receiverId: otroId });
        res.status(201).json({ message: "Solicitud enviada a " + otroUsuario.username });
    } catch (error) {
        res.status(500).json({ message: "Error al enviar la solicitud", error: error.message });
    }
};

const aceptarSolicitud = async (req, res) => {
    try {
        const otroId = Number(req.params.id);

        // Solo puede aceptar quien la recibio
        const solicitud = await Amistades.findOne({
            where: { senderId: otroId, receiverId: req.usuario.id, status: "pendiente" },
        });
        if (!solicitud) {
            return res.status(404).json({ message: "No hay una solicitud pendiente de esa persona" });
        }

        solicitud.status = "aceptada";
        await solicitud.save();
        res.status(200).json({ message: "Ahora son amigos" });
    } catch (error) {
        res.status(500).json({ message: "Error al aceptar la solicitud", error: error.message });
    }
};

// Sirve para rechazar una solicitud, cancelar la que envie o eliminar a un amigo
const eliminarAmistad = async (req, res) => {
    try {
        const otroId = Number(req.params.id);
        const relacion = await buscarAmistad(req.usuario.id, otroId);
        if (!relacion) {
            return res.status(404).json({ message: "No existe amistad ni solicitud con esa persona" });
        }

        await relacion.destroy();
        res.status(200).json({ message: "Listo" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la amistad", error: error.message });
    }
};

const getAmigos = async (req, res) => {
    try {
        const ids = await obtenerAmigos(req.usuario.id);
        const usuarios = await User.findAll({
            where: { id: ids },
            attributes: ["id", "username", "profilePicture"],
        });
        res.status(200).json({ usuarios });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los amigos", error: error.message });
    }
};

// Solicitudes que me enviaron y todavia no acepte
const getSolicitudes = async (req, res) => {
    try {
        const solicitudes = await Amistades.findAll({
            where: { receiverId: req.usuario.id, status: "pendiente" },
        });
        const ids = [];
        for (let i = 0; i < solicitudes.length; i++) {
            ids.push(solicitudes[i].senderId);
        }
        const usuarios = await User.findAll({
            where: { id: ids },
            attributes: ["id", "username", "profilePicture"],
        });
        res.status(200).json({ usuarios });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las solicitudes", error: error.message });
    }
};

module.exports = {
    obtenerPerfil,
    actualizarPerfil,
    getFeed,
    getUsuarios,
    seguir,
    dejarDeSeguir,
    getSeguidores,
    getSiguiendo,
    buscarUser,
    obtenerUserPorId,
    actualizarContraseña,
    eliminarCuenta,
    recuperarCuenta,
    reiniciarContraseña,
    verPerfil,
    enviarSolicitud,
    aceptarSolicitud,
    eliminarAmistad,
    getAmigos,
    getSolicitudes
};
