const { Usuarios, Mensajes, Grupos, MiembrosGrupo, Servidores, MiembrosServidor, Canales} = require("../models");
const { obtenerContactos, esMiembroGrupo, buscarMiembroServidor, textoValido } = require("../utilities/utilidades.js");

const incluirAutor = [{ model: Usuarios, as: "autor", attributes: ["id", "username", "profilePicture"] }];
const incluirUsuario = [{ model: Usuarios, as: "usuario", attributes: ["id", "username", "profilePicture"] }];

const getContactos = async (req, res) => {
    try {
        const ids = await obtenerContactos(req.usuario.id);
        const usuarios = await Usuarios.findAll({
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
        const content = req.body.content || "";
        const archivo = req.file ? req.file.filename : null;
        if (!textoValido(content) && !archivo) {
            return res.status(400).json({ message: "El mensaje no puede estar vacio" });
        }

        const contactos = await obtenerContactos(req.usuario.id);
        if (!contactos.includes(otroId)) {
            return res.status(403).json({ message: "Solo podes chatear con amigos o con personas que se siguen mutuamente" });
        }

        await Mensajes.create({ content: content.trim(), archivo: archivo, senderId: req.usuario.id, receiverId: otroId });
        res.status(201).json({ message: "Mensaje enviado" });
    } catch (error) {
        res.status(500).json({ message: "Error al enviar el mensaje", error: error.message });
    }
};

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
        const content = req.body.content || "";
        const archivo = req.file ? req.file.filename : null;
        if (!textoValido(content) && !archivo) {
            return res.status(400).json({ message: "El mensaje no puede estar vacio" });
        }
        if (!(await esMiembroGrupo(grupoId, req.usuario.id))) {
            return res.status(403).json({ message: "No sos miembro de este grupo" });
        }

        await Mensajes.create({ content: content.trim(), archivo: archivo, senderId: req.usuario.id, grupoId: grupoId });
        res.status(201).json({ message: "Mensaje enviado" });
    } catch (error) {
        res.status(500).json({ message: "Error al enviar el mensaje", error: error.message });
    }
};


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

        await Canales.create({ servidorId: servidor.id, name: "general" });

        res.status(201).json({ message: "Servidor creado", servidor });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el servidor", error: error.message });
    }
};

const getServidor = async (req, res) => {
    try {
        const servidorId = Number(req.params.id);
        const yo = await buscarMiembroServidor(servidorId, req.usuario.id);
        if (!yo) {
            return res.status(403).json({ message: "No sos miembro de este servidor" });
        }

        const servidor = await Servidores.findByPk(servidorId);
        const canales = await Canales.findAll({ where: { servidorId: servidorId, type: "texto" } });
        const filas = await MiembrosServidor.findAll({ where: { servidorId: servidorId }, include: incluirUsuario });

        const miembros = [];
        for (let i = 0; i < filas.length; i++) {
            miembros.push(filas[i].usuario);
        }

        res.status(200).json({ servidor, canales, miembros });
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
        const { name } = req.body;

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
        const canal = await Canales.create({ servidorId: servidorId, name: name.trim() });
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
        const content = req.body.content || "";
        const archivo = req.file ? req.file.filename : null;
        if (!textoValido(content) && !archivo) {
            return res.status(400).json({ message: "El mensaje no puede estar vacio" });
        }

        const canal = await Canales.findByPk(Number(req.params.id));
        if (!canal || canal.type !== "texto") {
            return res.status(404).json({ message: "El canal de texto no existe" });
        }
        if (!(await buscarMiembroServidor(canal.servidorId, req.usuario.id))) {
            return res.status(403).json({ message: "No sos miembro de este servidor" });
        }

        await Mensajes.create({ content: content.trim(), archivo: archivo, senderId: req.usuario.id, canalId: canal.id });
        res.status(201).json({ message: "Mensaje enviado" });
    } catch (error) {
        res.status(500).json({ message: "Error al enviar el mensaje", error: error.message });
    }
};

const editarServidor = async (req, res) => {
    try {
        const servidor = await Servidores.findByPk(Number(req.params.id));
        if (!servidor) {
            return res.status(404).json({ message: "El servidor no existe" });
        }
        if (servidor.ownerId !== req.usuario.id) {
            return res.status(403).json({ message: "Solo el creador puede editar el servidor" });
        }
        if (!textoValido(req.body.name)) {
            return res.status(400).json({ message: "El servidor necesita un nombre" });
        }

        servidor.name = req.body.name.trim();
        if (req.file) {
            servidor.imagen = req.file.filename;
        }
        await servidor.save();
        res.status(200).json({ message: "Servidor actualizado", servidor });
    } catch (error) {
        res.status(500).json({ message: "Error al editar el servidor", error: error.message });
    }
};

const salirDelServidor = async (req, res) => {
    try {
        const servidorId = Number(req.params.id);
        const servidor = await Servidores.findByPk(servidorId);
        if (!servidor) {
            return res.status(404).json({ message: "El servidor no existe" });
        }
        if (servidor.ownerId === req.usuario.id) {
            return res.status(400).json({ message: "Sos el creador: si no lo queres mas, eliminalo" });
        }

        await MiembrosServidor.destroy({ where: { servidorId: servidorId, userId: req.usuario.id } });
        res.status(200).json({ message: "Saliste del servidor" });
    } catch (error) {
        res.status(500).json({ message: "Error al salir del servidor", error: error.message });
    }
};

const eliminarServidor = async (req, res) => {
    try {
        const servidorId = Number(req.params.id);
        const servidor = await Servidores.findByPk(servidorId);
        if (!servidor) {
            return res.status(404).json({ message: "El servidor no existe" });
        }
        if (servidor.ownerId !== req.usuario.id) {
            return res.status(403).json({ message: "Solo el creador puede eliminar el servidor" });
        }

        const canales = await Canales.findAll({ where: { servidorId: servidorId } });
        const ids = [];
        for (let i = 0; i < canales.length; i++) {
            ids.push(canales[i].id);
        }
        await Mensajes.destroy({ where: { canalId: ids } });
        await Canales.destroy({ where: { servidorId: servidorId } });
        await MiembrosServidor.destroy({ where: { servidorId: servidorId } });
        await servidor.destroy();
        res.status(200).json({ message: "Servidor eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el servidor", error: error.message });
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
    editarServidor,
    salirDelServidor,
    eliminarServidor
};