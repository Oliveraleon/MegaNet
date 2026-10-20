const User = require("../models/usuarios.models.js");

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

module.exports = {
    obtenerPerfil,
    actualizarPerfil
};
