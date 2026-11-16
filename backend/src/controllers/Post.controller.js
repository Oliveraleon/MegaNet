const { Publicaciones, Reacciones, Comentarios, Usuarios} = require("../models");

const getUserPosts = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const publicaciones = await Publicaciones.findAll({
            where: { userId: usuarioId },
            order: [["creationDate", "DESC"]]
        });
        const postsConDatos = await agregarDatos(publicaciones, req.usuario.id);
        res.status(200).json(postsConDatos);
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
        const postsConDatos = await agregarDatos(publicaciones, req.usuario.id);
        res.status(200).json(postsConDatos);
    }catch(error){
        console.error("Error al obtener publicaciones:", error);
        return res.status(500).json({
            message: "Error al obtener las publicaciones",
            error: error.message
        });
    }
};

const crearPublicacion = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { content } = req.body;

        let multimedia = null;
        if (req.files && req.files.imagen && req.files.imagen[0]) {
            multimedia = `uploads/${req.files.imagen[0].filename}`;
        } else if (req.files && req.files.video && req.files.video[0]) {
            multimedia = `uploads/${req.files.video[0].filename}`;
        }

        const textoValido = content && content.trim() !== "";

        if (!textoValido && !multimedia) {
            return res.status(400).json({ message: "Escribi un texto para la publicacion" });
        }
        if (textoValido && content.trim().length > 255) {
            return res.status(400).json({ message: "El texto es muy largo (maximo 255 caracteres)" });
        }

        const nuevaPublicacion = await Publicaciones.create({
            content: textoValido ? content.trim() : "",
            multimedia: multimedia,
            privacy: "public",
            userId: usuarioId,
            creationDate: new Date()
        });

        res.status(201).json({ message: "Publicacion creada con exito", publicacion: nuevaPublicacion });
    } catch (error) {
        console.error("Error al crear la publicacion:", error);
        res.status(500).json({ message: "Error al crear la publicacion", error: error.message });
    }
};

const editarPublicacion = async (req, res) => {
    try {
        const post = await Publicaciones.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "La publicacion no existe" });
        }
        if (post.userId !== req.usuario.id) {
            return res.status(403).json({ message: "Solo podes editar tus propias publicaciones" });
        }

        const { content } = req.body;
        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "El texto no puede quedar vacio" });
        }
        if (content.length > 255) {
            return res.status(400).json({ message: "El texto es muy largo (maximo 255 caracteres)" });
        }

        post.content = content.trim();
        await post.save();
        res.status(200).json({ message: "Publicacion editada" });
    } catch (error) {
        res.status(500).json({ message: "Error al editar la publicacion", error: error.message });
    }
};

const eliminarPublicacion = async (req, res) => {
    try {
        const post = await Publicaciones.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "La publicacion no existe" });
        }
        const esDueño = Number(post.userId) === Number(req.usuario.id);
        const esAdmin = req.usuario.rol === "admin";
        if (!esDueño && !esAdmin) {
            return res.status(403).json({ message: "Solo podes eliminar tus propias publicaciones" });
        }

        await Reacciones.destroy({ where: { postId: post.id } });
        await Comentarios.destroy({ where: { postId: post.id } });
        await post.destroy();
        res.status(200).json({ message: "Publicacion eliminada" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la publicacion", error: error.message });
    }
};

const darLike = async (req, res) => {
    try {
        const post = await Publicaciones.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "La publicacion no existe" });
        }

        const yaLeDioLike = await Reacciones.findOne({
            where: { postId: post.id, userId: req.usuario.id },
        });
        if (!yaLeDioLike) {
            await Reacciones.create({ type: "like", postId: post.id, userId: req.usuario.id });
        }

        const likes = await Reacciones.count({ where: { postId: post.id, type: "like" } });
        res.status(200).json({ liked: true, likes });
    } catch (error) {
        res.status(500).json({ message: "Error al dar like", error: error.message });
    }
};

const quitarLike = async (req, res) => {
    try {
        const post = await Publicaciones.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "La publicacion no existe" });
        }

        await Reacciones.destroy({ where: { postId: post.id, userId: req.usuario.id } });

        const likes = await Reacciones.count({ where: { postId: post.id, type: "like" } });
        res.status(200).json({ liked: false, likes });
    } catch (error) {
        res.status(500).json({ message: "Error al sacar el like", error: error.message });
    }
};

const getComentarios = async (req, res) => {
    try {
        const comentarios = await Comentarios.findAll({
            where: { postId: req.params.id },
            include: [{ model: Usuarios, as: "autor", attributes: ["id", "username", "profilePicture"] }],
            order: [["creationDate", "ASC"]],
        });
        res.status(200).json(comentarios);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los comentarios", error: error.message });
    }
};

const crearComentario = async (req, res) => {
    try {
        const post = await Publicaciones.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "La publicacion no existe" });
        }
        const { text } = req.body;
        if (!text || text.trim() === "") {
            return res.status(400).json({ message: "El comentario no puede estar vacio" });
        }
        if (text.length > 255) {
            return res.status(400).json({ message: "El comentario es muy largo (maximo 255 caracteres)" });
        }

        const nuevoComentario = await Comentarios.create({ 
            text: text.trim(), 
            postId: post.id, 
            userId: req.usuario.id });
        const comentarioConAutor = await Comentarios.findByPk(nuevoComentario.id,{
            include: [{ model: Usuarios, as: "autor", attributes: ["id", "username", "profilePicture"] }]
        });
        res.status(201).json({ message: "Comentario creado", comentario: comentarioConAutor });
    } catch (error) {
        res.status(500).json({ message: "Error al comentar", error: error.message });
    }
};

const eliminarComentario = async (req, res) => {
    try{
        const comentario = await Comentarios.findByPk(req.params.comentarioId);
        if(!comentario){
            return res.status(404).json({message: "El comentario no existe"});
        }
        const esDueño = Number(comentario.userId) === Number(req.usuario.id);
        const esAdminRol = req.usuario.rol === "admin";
        if (!esDueño && !esAdminRol) {
            return res.status(403).json({ message: "No se puede eliminar comentarios de otros usuarios" });
        }
        await comentario.destroy();
        res.status(200).json({message: "Comentario eliminado"});
    }catch(error){
        res.status(500).json({message: "Error al eliminar el comentario", error: error.message});
    }
}

const agregarDatos = async (posts, userId) => {
    const lista = [];
    for (const p of posts) {
        const post = p.toJSON();
        post.likes = await Reacciones.count({ where: { postId: p.id, type: "like" } });
        post.cantidadComentarios = await Comentarios.count({ where: { postId: p.id } });
        post.liked = false;
        if (userId) {
            const miLike = await Reacciones.findOne({ where: { postId: p.id, userId: userId, type: "like" } });
            post.liked = miLike !== null;
        }
        lista.push(post);
    }
    return lista;
};

module.exports = {
    getUserPosts,
    getPostByUser,
    crearPublicacion,
    editarPublicacion,
    eliminarPublicacion,
    darLike,
    quitarLike,
    getComentarios,
    crearComentario,
    agregarDatos,
    eliminarComentario,
};