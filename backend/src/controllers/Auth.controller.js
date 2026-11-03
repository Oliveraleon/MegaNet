const User = require("../models/Usuarios.models.js");
const Reacciones = require("../models/Reacciones.models.js");
const Comentarios = require("../models/Comentarios.models.js");
const Publicaciones = require("../models/Publicaciones.models.js");
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
            { id: user.id, email: user.email, rol: user.rol },
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
                description: user.description,
                profilePicture: user.profilePicture,
                profileBanner: user.profileBanner,
                rol: user.rol
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

const crearPublicacion = async (req, res) => {
    try {
        const { content } = req.body;
        const multimedia = req.file ? req.file.filename : req.body.multimedia;

        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Escribi un texto para la publicacion" });
        }
        if (content.length > 255) {
            return res.status(400).json({ message: "El texto es muy largo (maximo 255 caracteres)" });
        }

        await Publicaciones.create({
            content: content.trim(),
            multimedia: multimedia || null,
            privacy: "public",
            userId: req.usuario.id,
        });
        res.status(201).json({ message: "Publicacion creada" });
    } catch (error) {
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
            include: [{ model: User, as: "autor", attributes: ["id", "username", "profilePicture"] }],
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
            include: [{ model: User, as: "autor", attributes: ["id", "username", "profilePicture"] }]
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
        if (comentario.userId !== req.usuario.id) {
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
    register,
    login,
    crearPublicacion,
    editarPublicacion,
    eliminarPublicacion,
    darLike,
    quitarLike,
    getComentarios,
    crearComentario,
    agregarDatos,
    eliminarComentario,
    JWT_SECRET
};