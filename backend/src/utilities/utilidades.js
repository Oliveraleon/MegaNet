const Seguidores = require("../models/Seguidores.models.js");
const Amistades = require("../models/Amistades.models.js");
const MiembrosGrupo = require("../models/MiembrosGrupo.models.js");
const MiembrosServidor = require("../models/MiembrosServidor.models.js");
const { Op } = require("sequelize");
const Usuarios = require("../models/Usuarios.models.js");
const Publicaciones = require("../models/Publicaciones.models.js");
const Comentarios = require("../models/Comentarios.models.js");
const Reacciones = require("../models/Reacciones.models.js");
const Mensajes = require("../models/Mensajes.models.js");
const Eventos = require("../models/Eventos.models.js");
const Notificaciones = require("../models/Notificaciones.models.js");

const obtenerSeguidos = async (userId) => {
    const relaciones = await Seguidores.findAll({ 
        where: 
        { 
            followerId: userId,
            status: "aceptado"
        } 
    });
    
    const ids = [];
    for (let i = 0; i < relaciones.length; i++) {
        ids.push(relaciones[i].followedId);
    }
    return ids;
};


const obtenerSeguidoresIds = async (userId) => {
    const relaciones = await Seguidores.findAll({ where: { followedId: userId, status: "aceptado" } });
    const ids = [];
    for (let i = 0; i < relaciones.length; i++) {
        ids.push(relaciones[i].followerId);
    }
    return ids;
};


const obtenerAmigos = async (userId) => {
    const enviadas = await Amistades.findAll({ where: { senderId: userId, status: "aceptada" } });
    const recibidas = await Amistades.findAll({ where: { receiverId: userId, status: "aceptada" } });
    const ids = [];
    for (let i = 0; i < enviadas.length; i++) {
        ids.push(enviadas[i].receiverId);
    }
    for (let i = 0; i < recibidas.length; i++) {
        ids.push(recibidas[i].senderId);
    }
    return ids;
};


const buscarAmistad = async (idA, idB) => {
    const directa = await Amistades.findOne({ where: { senderId: idA, receiverId: idB } });
    if (directa) {
        return directa;
    }
    return await Amistades.findOne({ where: { senderId: idB, receiverId: idA } });
};


const agregarRelacion = (posts, seguidos, seguidores, amigos) => {
    for (let i = 0; i < posts.length; i++) {
        posts[i].loSigo = seguidos.includes(posts[i].userId);
        posts[i].meSigue = seguidores.includes(posts[i].userId);
        posts[i].esAmigo = amigos.includes(posts[i].userId);
    }
    return posts;
};


const obtenerContactos = async (userId) => {
    const amigos = await obtenerAmigos(userId);
    const seguidos = await obtenerSeguidos(userId);
    const seguidores = await obtenerSeguidoresIds(userId);

    const ids = [];
    for (let i = 0; i < amigos.length; i++) {
        ids.push(amigos[i]);
    }
    for (let i = 0; i < seguidos.length; i++) {
        if (seguidores.includes(seguidos[i]) && !ids.includes(seguidos[i])) {
            ids.push(seguidos[i]);
        }
    }
    return ids;
};

const esMiembroGrupo = async (grupoId, userId) => {
    const miembro = await MiembrosGrupo.findOne({ where: { grupoId: grupoId, userId: userId } });
    return miembro !== null;
};

const buscarMiembroServidor = async (servidorId, userId) => {
    return await MiembrosServidor.findOne({ where: { servidorId: servidorId, userId: userId } });
};

const textoValido = (content) => {
    return content && content.trim() !== "";
};

// ---------- Agregado: admin, privacidad, notificaciones y borrar usuario ----------

// true si el usuario logueado es administrador (el rol viaja dentro del token)
const esAdmin = (usuario) => {
    return usuario && usuario.rol === "admin";
};

// Decide si un usuario puede ver una publicacion segun su privacidad
const puedeVerPost = (post, userId, amigos) => {
    if (post.userId === userId) return true;
    if (post.privacy === "private") return false;
    if (post.privacy === "friends") return amigos.includes(post.userId);
    return true;
};

// Crea un aviso para la campanita
const notificar = async (userId, texto, link) => {
    await Notificaciones.create({ userId: userId, texto: texto, link: link });
};

// Borra un usuario y todo lo que depende de el (para no romper las claves foraneas)
const borrarUsuario = async (userId) => {
    const posts = await Publicaciones.findAll({ where: { userId: userId } });
    const idsPosts = [];
    for (let i = 0; i < posts.length; i++) {
        idsPosts.push(posts[i].id);
    }
    await Reacciones.destroy({ where: { [Op.or]: [{ postId: idsPosts }, { userId: userId }] } });
    await Comentarios.destroy({ where: { [Op.or]: [{ postId: idsPosts }, { userId: userId }] } });
    await Publicaciones.destroy({ where: { userId: userId } });
    await Seguidores.destroy({ where: { [Op.or]: [{ followerId: userId }, { followedId: userId }] } });
    await Amistades.destroy({ where: { [Op.or]: [{ senderId: userId }, { receiverId: userId }] } });
    await Mensajes.destroy({ where: { [Op.or]: [{ senderId: userId }, { receiverId: userId }] } });
    await MiembrosGrupo.destroy({ where: { userId: userId } });
    await MiembrosServidor.destroy({ where: { userId: userId } });
    await Eventos.destroy({ where: { creadorId: userId } });
    await Notificaciones.destroy({ where: { userId: userId } });
    await Usuarios.destroy({ where: { id: userId } });
};

module.exports = {
    esAdmin,
    puedeVerPost,
    notificar,
    borrarUsuario,
    obtenerSeguidos,
    obtenerSeguidoresIds,
    obtenerAmigos,
    buscarAmistad,
    agregarRelacion,
    obtenerContactos,
    esMiembroGrupo,
    buscarMiembroServidor,
    textoValido
};