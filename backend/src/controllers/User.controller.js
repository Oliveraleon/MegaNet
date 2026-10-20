const User = require("../models/usuarios.models.js");
const Publicaciones = require("../models/Publicaciones.models.js");
const Seguidores = require("../models/Seguidores.models.js");

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

const obtenerSeguidos = async (userId) => {
    const relaciones = await Seguidores.findAll({ 
        where: 
        { 
            followerId: userId 
        } 
    });
    
    const ids = [];
    for (let i = 0; i < relaciones.length; i++) {
        ids.push(relaciones[i].followedId);
    }
    return ids;
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
            return res.status(200).json({ tipo: "invitado", posts });
        }

        const seguidos = await obtenerSeguidos(req.usuario.id);
        if (seguidos.length === 0) {
            return res.status(200).json({ tipo: "registrado", posts: [] });
        }

        const posts = await Publicaciones.findAll({
            where: { userId: seguidos, privacy: ["public", "friends"] },
            include: incluirAutor,
            order: [["creationDate", "DESC"]],
        });
        res.status(200).json({ tipo: "registrado", posts });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el feed"});
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
        const relaciones = await Seguidores.findAll({ where: { followedId: req.usuario.id } });
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
        const seguidos = await obtenerSeguidos(req.usuario.id);
        const usuarios = await User.findAll({
            where: { id: seguidos },
            attributes: ["id", "username", "profilePicture"],
        });
        res.status(200).json({ usuarios, seguidos });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener seguidos", error: error.message });
    }
};

module.exports = {
    obtenerPerfil,
    actualizarPerfil,
    obtenerSeguidos,
    getFeed,
    getUsuarios,
    seguir,
    dejarDeSeguir,
    getSeguidores,
    getSiguiendo
};
