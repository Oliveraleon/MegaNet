
const {
    Publicaciones,
    Comentarios,
    Reacciones,
    Perfil,
} = require("../models/index.js");

const fs = require("fs");
const path = require("path");


const obtenerPublicaciones = async (req, res) => {
    try {
        const publicaciones = await Publicaciones.findAll({
            where: { activo: true },
            include: [
                {
                    association: "autor",
                    attributes: ["id", "email"],
                    include: [
                        {
                            association: "perfil",
                            attributes: ["username"],
                            required: false,
                        },
                    ],
                    required: false,
                },
            ],
            order: [["creationDate", "DESC"]],
        });

        res.status(200).json(publicaciones);
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener publicaciones",
            error: error.message,
        });
    }
};


const crearPublicacion = async (req, res) => {
    try {
        const { content, privacy } = req.body;

        if ((!content || !content.trim()) && !req.file) {
            return res.status(400).json({
                message: "La publicación debe tener texto o una imagen",
            });
        }

        const publicacion = await Publicaciones.create({
            content: content?.trim() || (req.file ? " " : ""),
            multimedia: req.file ? req.file.filename : null,
            privacy: privacy || "public",
            userId: req.usuario.id,
            activo: true,
        });

        res.status(201).json({
            message: "Publicación creada correctamente",
            publicacion,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al crear publicación",
            error: error.message,
        });
    }
};

const eliminarPublicacion = async (req, res) => {
    try {
        const publicacion = await Publicaciones.findByPk(req.params.id);

        if (!publicacion || !publicacion.activo) {
            return res.status(404).json({
                message: "Publicación no encontrada",
            });
        }

        if (publicacion.userId !== req.usuario.id) {
            return res.status(403).json({
                message: "No podés eliminar esta publicación",
            });
        }

        await publicacion.update({ activo: false });

        await Comentarios.update(
            { activo: false },
            { where: { postId: publicacion.id } }
        );

        await Reacciones.destroy({
            where: { postId: publicacion.id },
        });

        if (publicacion.multimedia) {
            const archivo = path.join(
                __dirname,
                "..",
                "..",
                "uploads",
                publicacion.multimedia
            );

            if (fs.existsSync(archivo)) {
                fs.unlinkSync(archivo);
            }
        }

        res.status(200).json({
            message: "Publicación desactivada correctamente",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al desactivar publicación",
            error: error.message,
        });
    }
};

module.exports = {
    obtenerPublicaciones,
    crearPublicacion,
    eliminarPublicacion,
};

