
const { Router } = require("express");
const { obtenerPerfil, actualizarPerfil, getFeed, getUsuarios, seguir, dejarDeSeguir, getSeguidores, getSiguiendo, verPerfil, enviarSolicitud, aceptarSolicitud, eliminarAmistad, getAmigos, getSolicitudes } = require("../controllers/User.controller.js");
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
route.get('/perfil/:id', verificarToken, verPerfil)
route.get('/amigos', verificarToken, getAmigos)
route.get('/solicitudes', verificarToken, getSolicitudes)
route.post('/amistad/:id', verificarToken, enviarSolicitud)
route.post('/amistad/:id/aceptar', verificarToken, aceptarSolicitud)
route.delete('/amistad/:id', verificarToken, eliminarAmistad)

module.exports = route;
    