const {Publicaciones} = require("../models");

const getUserPosts = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const publicaciones = await Publicaciones.findAll({
            where: { userId: usuarioId },
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

const getPostByUser = async (req,res) =>{
    try{
        const { id } = req.params
        const publicaciones = await Publicaciones.findAll({
            where: { userId: id},
            order: [["creationDate", "DESC"]]
        });
        res.status(200).json(publicaciones)
    }catch(error){
        console.error("Error al obtener publicaciones:", error);
        return res.status(500).json({
            message: "Error al obtener las publicaciones",
            error: error.message
        });
    }
};

module.exports = {
    getUserPosts,
    getPostByUser
};