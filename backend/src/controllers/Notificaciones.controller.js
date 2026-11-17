
const { Op } = require("sequelize");
const Notificaciones = require("../models/Notificaciones.models.js");
const Eventos = require("../models/Eventos.models.js");
const Grupos = require("../models/Grupos.models.js");
const MiembrosGrupo = require("../models/MiembrosGrupo.models.js");
const Servidores = require("../models/Servidores.models.js");
const MiembrosServidor = require("../models/MiembrosServidor.models.js");

// Crea un recordatorio para los eventos de mis grupos y servidores que pasan en las proximas 24 horas
const crearRecordatorios = async (userId) => {
    const filasGrupos = await MiembrosGrupo.findAll({ where: { userId: userId } });
    const idsGrupos = [];
    for (let i = 0; i < filasGrupos.length; i++) {
        idsGrupos.push(filasGrupos[i].grupoId);
    }
    const filasServidores = await MiembrosServidor.findAll({ where: { userId: userId } });
    const idsServidores = [];
    for (let i = 0; i < filasServidores.length; i++) {
        idsServidores.push(filasServidores[i].servidorId);
    }

    const ahora = new Date();
    const manana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
    let eventos = [];
    if (idsGrupos.length > 0) {
        eventos = await Eventos.findAll({
            where: { grupoId: idsGrupos, fecha: { [Op.between]: [ahora, manana] } },
        });
    }
    if (idsServidores.length > 0) {
        const deServidores = await Eventos.findAll({
            where: { servidorId: idsServidores, fecha: { [Op.between]: [ahora, manana] } },
        });
        eventos = eventos.concat(deServidores);
    }

    for (let i = 0; i < eventos.length; i++) {
        const yaExiste = await Notificaciones.findOne({ where: { userId: userId, eventoId: eventos[i].id } });
        if (!yaExiste) {
            let lugar = "";
            let link = "/chat";
            if (eventos[i].grupoId) {
                const grupo = await Grupos.findByPk(eventos[i].grupoId);
                if (grupo) lugar = grupo.name;
            } else {
                const servidor = await Servidores.findByPk(eventos[i].servidorId);
                if (servidor) lugar = servidor.name;
                link = "/servidores";
            }
            const hora = new Date(eventos[i].fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
            await Notificaciones.create({
                userId: userId,
                eventoId: eventos[i].id,
                texto: "⏰ Recordatorio: " + eventos[i].titulo + " a las " + hora + " (" + lugar + ")",
                link: link,
            });
        }
    }
};

const getNotificaciones = async (req, res) => {
    try {
        await crearRecordatorios(req.usuario.id);

        const notificaciones = await Notificaciones.findAll({
            where: { userId: req.usuario.id },
            order: [["fecha", "DESC"]],
            limit: 30,
        });
        const sinLeer = await Notificaciones.count({ where: { userId: req.usuario.id, leida: false } });
        res.status(200).json({ notificaciones, sinLeer });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las notificaciones", error: error.message });
    }
};

const marcarLeidas = async (req, res) => {
    try {
        await Notificaciones.update({ leida: true }, { where: { userId: req.usuario.id } });
        res.status(200).json({ message: "Notificaciones leídas" });
    } catch (error) {
        res.status(500).json({ message: "Error al marcar las notificaciones", error: error.message });
    }
};

module.exports = {
    getNotificaciones,
    marcarLeidas
};
