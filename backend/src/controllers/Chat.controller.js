const User = require("../models/Usuarios.models.js");
const Mensajes = require("../models/Mensajes.models.js");
const Grupos = require("../models/Grupos.models.js");
const MiembrosGrupo = require("../models/MiembrosGrupo.models.js");
const Servidores = require("../models/Servidores.models.js");
const MiembrosServidor = require("../models/MiembrosServidor.models.js");
const Canales = require("../models/Canales.models.js");
const { obtenerSeguidos, obtenerSeguidoresIds, obtenerAmigos } = require("./User.controller.js");

const incluirAutor = [{ model: User, as: "autor", attributes: ["id", "username", "profilePicture"] }];
const incluirUsuario = [{ model: User, as: "usuario", attributes: ["id", "username", "profilePicture"] }];

// ---------- Funciones de ayuda ----------

// Ids de las personas con las que puedo chatear:
// mis amigos y las personas que nos seguimos mutuamente
const obtenerContactos = async (userId) => {
    const amigos = await obtenerAmigos(userId);
    const seguidos = await obtenerSeguidos(userId);
    const seguidores = await obtenerSeguidoresIds(userId);

    const ids = [];
    for (let i = 0; i < amigos.length; i++) {
        ids.push(amigos[i]);
    }
    for (let i = 0; i < seguidos.length; i++) {
        // Lo sigo, me sigue y todavia no esta en la lista
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

// Revisa que el texto del mensaje no este vacio
const textoValido = (content) => {
    return content && content.trim() !== "";
};

// ---------- Chat privado ----------

const getContactos = async (req, res) => {
    try {
        const ids = await obtenerContactos(req.usuario.id);
        const usuarios = await User.findAll({
            where: { id: ids },
            attributes: ["id", "username", "profilePicture"],
        });
        res.status(200).json({ usuarios });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los contactos", error: error.message });
    }
};

const getMensajesPrivados = async (req, res) => {
    try {
        const otroId = Number(req.params.id);
        const contactos = await obtenerContactos(req.usuario.id);
        if (!contactos.includes(otroId)) {
            return res.status(403).json({ message: "Solo podes chatear con amigos o con personas que se siguen mutuamente" });
        }

        // Mensajes que yo le mande a el y que el me mando a mi
        const mensajes = await Mensajes.findAll({
            where: {
                senderId: [req.usuario.id, otroId],
                receiverId: [req.usuario.id, otroId],
            },
            include: incluirAutor,
            order: [["creationDate", "ASC"]],
        });
        res.status(200).json({ mensajes });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los mensajes", error: error.message });
    }
};

const enviarMensajePrivado = async (req, res) => {
    try {
        const otroId = Number(req.params.id);
        const { content } = req.body;
        if (!textoValido(content)) {
            return res.status(400).json({ message: "El mensaje no puede estar vacio" });
        }

        const contactos = await obtenerContactos(req.usuario.id);
        if (!contactos.includes(otroId)) {
            return res.status(403).json({ message: "Solo podes chatear con amigos o con personas que se siguen mutuamente" });
        }

        await Mensajes.create({ content: content.trim(), senderId: req.usuario.id, receiverId: otroId });
        res.status(201).json({ message: "Mensaje enviado" });
    } catch (error) {
        res.status(500).json({ message: "Error al enviar el mensaje", error: error.message });
    }
};

// ---------- Grupos ----------

const getGrupos = async (req, res) => {
    try {
        const filas = await MiembrosGrupo.findAll({ where: { userId: req.usuario.id } });
        const ids = [];
        for (let i = 0; i < filas.length; i++) {
            ids.push(filas[i].grupoId);
        }
        const grupos = await Grupos.findAll({ where: { id: ids } });
        res.status(200).json({ grupos });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los grupos", error: error.message });
    }
};

const crearGrupo = async (req, res) => {
    try {
        const { name, miembros } = req.body;
        if (!textoValido(name)) {
            return res.status(400).json({ message: "El grupo necesita un nombre" });
        }

        // Solo se pueden agregar contactos (amigos o seguidores mutuos)
        const contactos = await obtenerContactos(req.usuario.id);
        const lista = miembros || [];
        for (let i = 0; i < lista.length; i++) {
            if (!contactos.includes(lista[i])) {
                return res.status(400).json({ message: "Solo podes agregar amigos o personas que se siguen mutuamente" });
            }
        }

        const grupo = await Grupos.create({ name: name.trim(), ownerId: req.usuario.id });
        await MiembrosGrupo.create({ grupoId: grupo.id, userId: req.usuario.id });
        for (let i = 0; i < lista.length; i++) {
            await MiembrosGrupo.create({ grupoId: grupo.id, userId: lista[i] });
        }
        res.status(201).json({ message: "Grupo creado", grupo });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el grupo", error: error.message });
    }
};

const getGrupo = async (req, res) => {
    try {
        const grupoId = Number(req.params.id);
        if (!(await esMiembroGrupo(grupoId, req.usuario.id))) {
            return res.status(403).json({ message: "No sos miembro de este grupo" });
        }

        const grupo = await Grupos.findByPk(grupoId);
        const filas = await MiembrosGrupo.findAll({ where: { grupoId: grupoId }, include: incluirUsuario });
        const miembros = [];
        for (let i = 0; i < filas.length; i++) {
            miembros.push(filas[i].usuario);
        }
        res.status(200).json({ grupo, miembros });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el grupo", error: error.message });
    }
};

const agregarMiembroGrupo = async (req, res) => {
    try {
        const grupoId = Number(req.params.id);
        const nuevoId = Number(req.body.userId);

        const grupo = await Grupos.findByPk(grupoId);
        if (!grupo) {
            return res.status(404).json({ message: "El grupo no existe" });
        }
        if (grupo.ownerId !== req.usuario.id) {
            return res.status(403).json({ message: "Solo el creador puede agregar miembros" });
        }

        const contactos = await obtenerContactos(req.usuario.id);
        if (!contactos.includes(nuevoId)) {
            return res.status(400).json({ message: "Solo podes agregar amigos o personas que se siguen mutuamente" });
        }
        if (await esMiembroGrupo(grupoId, nuevoId)) {
            return res.status(400).json({ message: "Ya es miembro del grupo" });
        }

        await MiembrosGrupo.create({ grupoId: grupoId, userId: nuevoId });
        res.status(201).json({ message: "Miembro agregado" });
    } catch (error) {
        res.status(500).json({ message: "Error al agregar el miembro", error: error.message });
    }
};

const salirDelGrupo = async (req, res) => {
    try {
        const grupoId = Number(req.params.id);
        const miembro = await MiembrosGrupo.findOne({ where: { grupoId: grupoId, userId: req.usuario.id } });
        if (!miembro) {
            return res.status(404).json({ message: "No sos miembro de este grupo" });
        }

        await miembro.destroy();
        res.status(200).json({ message: "Saliste del grupo" });
    } catch (error) {
        res.status(500).json({ message: "Error al salir del grupo", error: error.message });
    }
};

const getMensajesGrupo = async (req, res) => {
    try {
        const grupoId = Number(req.params.id);
        if (!(await esMiembroGrupo(grupoId, req.usuario.id))) {
            return res.status(403).json({ message: "No sos miembro de este grupo" });
        }

        const mensajes = await Mensajes.findAll({
            where: { grupoId: grupoId },
            include: incluirAutor,
            order: [["creationDate", "ASC"]],
        });
        res.status(200).json({ mensajes });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los mensajes", error: error.message });
    }
};

const enviarMensajeGrupo = async (req, res) => {
    try {
        const grupoId = Number(req.params.id);
        const { content } = req.body;
        if (!textoValido(content)) {
            return res.status(400).json({ message: "El mensaje no puede estar vacio" });
        }
        if (!(await esMiembroGrupo(grupoId, req.usuario.id))) {
            return res.status(403).json({ message: "No sos miembro de este grupo" });
        }

        await Mensajes.create({ content: content.trim(), senderId: req.usuario.id, grupoId: grupoId });
        res.status(201).json({ message: "Mensaje enviado" });
    } catch (error) {
        res.status(500).json({ message: "Error al enviar el mensaje", error: error.message });
    }
};

// ---------- Servidores y canales ----------

const getServidores = async (req, res) => {
    try {
        const filas = await MiembrosServidor.findAll({ where: { userId: req.usuario.id } });
        const ids = [];
        for (let i = 0; i < filas.length; i++) {
            ids.push(filas[i].servidorId);
        }
        const servidores = await Servidores.findAll({ where: { id: ids } });
        res.status(200).json({ servidores });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los servidores", error: error.message });
    }
};

const crearServidor = async (req, res) => {
    try {
        const { name } = req.body;
        if (!textoValido(name)) {
            return res.status(400).json({ message: "El servidor necesita un nombre" });
        }

        const servidor = await Servidores.create({ name: name.trim(), ownerId: req.usuario.id });
        await MiembrosServidor.create({ servidorId: servidor.id, userId: req.usuario.id });

        // Todo servidor arranca con un canal de texto y uno de voz
        await Canales.create({ servidorId: servidor.id, name: "general", type: "texto" });
        await Canales.create({ servidorId: servidor.id, name: "General", type: "voz" });

        res.status(201).json({ message: "Servidor creado", servidor });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el servidor", error: error.message });
    }
};

const getServidor = async (req, res) => {
    try {
        const servidorId = Number(req.params.id);
        if (!(await buscarMiembroServidor(servidorId, req.usuario.id))) {
            return res.status(403).json({ message: "No sos miembro de este servidor" });
        }

        const servidor = await Servidores.findByPk(servidorId);
        const canales = await Canales.findAll({ where: { servidorId: servidorId } });
        const filas = await MiembrosServidor.findAll({ where: { servidorId: servidorId }, include: incluirUsuario });

        const miembros = [];
        for (let i = 0; i < filas.length; i++) {
            miembros.push(filas[i].usuario);
        }

        // A cada canal le agregamos quienes estan conectados (solo sirve en los de voz)
        const lista = [];
        for (let i = 0; i < canales.length; i++) {
            const conectados = [];
            for (let j = 0; j < filas.length; j++) {
                if (filas[j].canalVozId === canales[i].id) {
                    conectados.push(filas[j].usuario);
                }
            }
            lista.push({
                id: canales[i].id,
                name: canales[i].name,
                type: canales[i].type,
                conectados: conectados,
            });
        }

        res.status(200).json({ servidor, canales: lista, miembros });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el servidor", error: error.message });
    }
};

const agregarMiembroServidor = async (req, res) => {
    try {
        const servidorId = Number(req.params.id);
        const nuevoId = Number(req.body.userId);

        const servidor = await Servidores.findByPk(servidorId);
        if (!servidor) {
            return res.status(404).json({ message: "El servidor no existe" });
        }
        if (servidor.ownerId !== req.usuario.id) {
            return res.status(403).json({ message: "Solo el creador puede invitar miembros" });
        }

        const contactos = await obtenerContactos(req.usuario.id);
        if (!contactos.includes(nuevoId)) {
            return res.status(400).json({ message: "Solo podes invitar amigos o personas que se siguen mutuamente" });
        }
        if (await buscarMiembroServidor(servidorId, nuevoId)) {
            return res.status(400).json({ message: "Ya es miembro del servidor" });
        }

        await MiembrosServidor.create({ servidorId: servidorId, userId: nuevoId });
        res.status(201).json({ message: "Miembro agregado" });
    } catch (error) {
        res.status(500).json({ message: "Error al agregar el miembro", error: error.message });
    }
};

const crearCanal = async (req, res) => {
    try {
        const servidorId = Number(req.params.id);
        const { name, type } = req.body;

        const servidor = await Servidores.findByPk(servidorId);
        if (!servidor) {
            return res.status(404).json({ message: "El servidor no existe" });
        }
        if (servidor.ownerId !== req.usuario.id) {
            return res.status(403).json({ message: "Solo el creador puede crear canales" });
        }
        if (!textoValido(name)) {
            return res.status(400).json({ message: "El canal necesita un nombre" });
        }
        if (type !== "texto" && type !== "voz") {
            return res.status(400).json({ message: "El tipo de canal tiene que ser texto o voz" });
        }

        const canal = await Canales.create({ servidorId: servidorId, name: name.trim(), type: type });
        res.status(201).json({ message: "Canal creado", canal });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el canal", error: error.message });
    }
};

const getMensajesCanal = async (req, res) => {
    try {
        const canal = await Canales.findByPk(Number(req.params.id));
        if (!canal || canal.type !== "texto") {
            return res.status(404).json({ message: "El canal de texto no existe" });
        }
        if (!(await buscarMiembroServidor(canal.servidorId, req.usuario.id))) {
            return res.status(403).json({ message: "No sos miembro de este servidor" });
        }

        const mensajes = await Mensajes.findAll({
            where: { canalId: canal.id },
            include: incluirAutor,
            order: [["creationDate", "ASC"]],
        });
        res.status(200).json({ mensajes });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los mensajes", error: error.message });
    }
};

const enviarMensajeCanal = async (req, res) => {
    try {
        const { content } = req.body;
        if (!textoValido(content)) {
            return res.status(400).json({ message: "El mensaje no puede estar vacio" });
        }

        const canal = await Canales.findByPk(Number(req.params.id));
        if (!canal || canal.type !== "texto") {
            return res.status(404).json({ message: "El canal de texto no existe" });
        }
        if (!(await buscarMiembroServidor(canal.servidorId, req.usuario.id))) {
            return res.status(403).json({ message: "No sos miembro de este servidor" });
        }

        await Mensajes.create({ content: content.trim(), senderId: req.usuario.id, canalId: canal.id });
        res.status(201).json({ message: "Mensaje enviado" });
    } catch (error) {
        res.status(500).json({ message: "Error al enviar el mensaje", error: error.message });
    }
};

// Entrar a un canal de voz: se guarda en que canal esta conectado el miembro
const entrarVoz = async (req, res) => {
    try {
        const canal = await Canales.findByPk(Number(req.params.id));
        if (!canal || canal.type !== "voz") {
            return res.status(404).json({ message: "El canal de voz no existe" });
        }
        const miembro = await buscarMiembroServidor(canal.servidorId, req.usuario.id);
        if (!miembro) {
            return res.status(403).json({ message: "No sos miembro de este servidor" });
        }

        miembro.canalVozId = canal.id;
        await miembro.save();
        res.status(200).json({ message: "Entraste al canal de voz" });
    } catch (error) {
        res.status(500).json({ message: "Error al entrar al canal de voz", error: error.message });
    }
};

const salirVoz = async (req, res) => {
    try {
        const canal = await Canales.findByPk(Number(req.params.id));
        if (!canal) {
            return res.status(404).json({ message: "El canal no existe" });
        }
        const miembro = await buscarMiembroServidor(canal.servidorId, req.usuario.id);
        if (!miembro) {
            return res.status(403).json({ message: "No sos miembro de este servidor" });
        }

        miembro.canalVozId = null;
        await miembro.save();
        res.status(200).json({ message: "Saliste del canal de voz" });
    } catch (error) {
        res.status(500).json({ message: "Error al salir del canal de voz", error: error.message });
    }
};

module.exports = {
    getContactos,
    getMensajesPrivados,
    enviarMensajePrivado,
    getGrupos,
    crearGrupo,
    getGrupo,
    agregarMiembroGrupo,
    salirDelGrupo,
    getMensajesGrupo,
    enviarMensajeGrupo,
    getServidores,
    crearServidor,
    getServidor,
    agregarMiembroServidor,
    crearCanal,
    getMensajesCanal,
    enviarMensajeCanal,
    entrarVoz,
    salirVoz
};