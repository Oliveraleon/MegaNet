const User = require("../models/Usuarios.models.js");
const Publicaciones = require("../models/Publicaciones.models.js");
const Comentarios = require("../models/Comentarios.models.js");
const Reacciones = require("../models/Reacciones.models.js");

// 1. Obtener todos los usuarios del sistema (Acción exclusiva de admin)
const obtenerTodosLosUsuarios = async (req, res) => {
    try {
        const usuarios = await User.findAll({
            attributes: { exclude: ["password"] } // Ocultamos las contraseñas por seguridad
        });
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los usuarios", error: error.message });
    }
};

// 2. Eliminar cualquier publicación (sin importar de quién sea)
const adminEliminarPublicacion = async (req, res) => {
    try {
        const post = await Publicaciones.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "La publicación no existe" });
        }

        // Borramos reacciones, comentarios asociados y el post
        await Reacciones.destroy({ where: { postId: post.id } });
        await Comentarios.destroy({ where: { postId: post.id } });
        await post.destroy();

        res.status(200).json({ message: "Publicación eliminada por el administrador" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la publicación", error: error.message });
    }
};

// 3. Eliminar cualquier comentario (sin importar de quién sea)
const adminEliminarComentario = async (req, res) => {
    try {
        const comentario = await Comentarios.findByPk(req.params.comentarioId);
        if (!comentario) {
            return res.status(404).json({ message: "El comentario no existe" });
        }

        await comentario.destroy();
        res.status(200).json({ message: "Comentario eliminado por el administrador" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el comentario", error: error.message });
    }
};

module.exports = {
    obtenerTodosLosUsuarios,
    adminEliminarPublicacion,
    adminEliminarComentario
};