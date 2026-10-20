
const { Router } = require("express");
const { obtenerPerfil, actualizarPerfil, getFeed, getUsuarios, seguir, dejarDeSeguir, getSeguidores, getSiguiendo, } = require("../controllers/User.controller.js");
const { verificarToken, tokenOpcional } = require("../middelwares/Auth.middleware.js");

const route = Router();

route.get("/profile", verificarToken, obtenerPerfil);
route.patch("/profile", verificarToken,actualizarPerfil)
route.get('/feed', tokenOpcional, getFeed)
route.get('/usuarios', verificarToken, getUsuarios)
route.get('/seguidores', verificarToken, getSeguidores)
route.get('/siguiendo', verificarToken, getSiguiendo)
route.post('/seguir/:id', verificarToken, seguir)
route.delete('/seguir/:id', verificarToken, dejarDeSeguir)

module.exports = route;
    