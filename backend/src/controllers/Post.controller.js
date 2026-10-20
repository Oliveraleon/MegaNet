const {Publicaciones} = require("../models");

const getUserPosts = async (req, res) => {
    try {
        const usuarioId = req.user.id;

        const publicaciones = await Publicaciones.findAll({
            where: { usuarioId },
            order: [["creationDate", "DESC"]]
        });
        res.status(200).json(publicaciones);
    } catch (error) {
        console.error("Error al obtener publicaciones:", error);
        return res.status(500).json({
            message: "Error al obtener las publicaciones",
            error: error.message
        });
    }
};

module.exports = {
    getUserPosts,
};