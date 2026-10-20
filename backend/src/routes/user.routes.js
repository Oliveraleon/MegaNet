
const { Router } = require("express");
const { obtenerPerfil, actualizarPerfil } = require("../controllers/User.controller.js");
const auth = require("../middelwares/auth.middelwares.js");

const route = Router();

route.get("/profile", auth, obtenerPerfil);
route.patch("/profile", auth,actualizarPerfil)

module.exports = route;
    