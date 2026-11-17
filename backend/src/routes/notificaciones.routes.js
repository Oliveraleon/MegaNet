const { Router } = require("express");
const { getNotificaciones, marcarLeidas } = require("../controllers/Notificaciones.controller.js");
const { verificarToken } = require("../middelwares/Auth.middleware.js");

const route = Router();

route.get('/', verificarToken, getNotificaciones)
route.put('/leidas', verificarToken, marcarLeidas)

module.exports = route;
