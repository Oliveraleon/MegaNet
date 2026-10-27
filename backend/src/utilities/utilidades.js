const Seguidores = require("../models/Seguidores.models.js");
const Amistades = require("../models/Amistades.models.js");
const MiembrosGrupo = require("../models/MiembrosGrupo.models.js");
const MiembrosServidor = require("../models/MiembrosServidor.models.js");

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


const obtenerSeguidoresIds = async (userId) => {
    const relaciones = await Seguidores.findAll({ where: { followedId: userId } });
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

module.exports = {
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