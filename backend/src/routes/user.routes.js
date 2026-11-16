
const { Router } = require("express");
const { obtenerPerfil, actualizarPerfil, getFeed, getUsuarios, seguir, dejarDeSeguir, getSeguidores, getSiguiendo, buscarUser, obtenerUserPorId, actualizarContraseña, eliminarCuenta, recuperarCuenta, 
    reiniciarContraseña, verPerfil, enviarSolicitud, aceptarSolicitud, eliminarAmistad, getAmigos, getSolicitudes } = require("../controllers/User.controller.js");
const { verificarToken, tokenOpcional } = require("../middelwares/Auth.middleware.js");
const { subirImagen } = require("../middelwares/upload.js");

const route = Router();

route.get("/profile", verificarToken, obtenerPerfil);
route.patch("/profile", verificarToken,subirImagen,actualizarPerfil)
route.get('/feed', tokenOpcional, getFeed)
route.get('/usuarios', verificarToken, getUsuarios)
route.get('/seguidores/', verificarToken, getSeguidores)
route.get('/seguidores/:id', verificarToken, getSeguidores)
route.get('/siguiendo/', verificarToken, getSiguiendo)
route.get('/siguiendo/:id', verificarToken, getSiguiendo)
route.post('/seguir/:id', verificarToken, seguir)
route.delete('/seguir/:id', verificarToken, dejarDeSeguir)
route.get("/buscar",verificarToken,buscarUser)
route.patch("/password", verificarToken, actualizarContraseña);
route.delete("/eliminar",verificarToken,eliminarCuenta);
route.post("/recuperarCuenta", recuperarCuenta)
route.post("/reiniciarContrasena", reiniciarContraseña)
route.get('/amigos', verificarToken, getAmigos)
route.get('/solicitudes', verificarToken, getSolicitudes)
route.post('/amistad/:id', verificarToken, enviarSolicitud)
route.post('/amistad/:id/aceptar', verificarToken, aceptarSolicitud)
route.delete('/amistad/:id', verificarToken, eliminarAmistad)
route.get('/perfil/:id', verificarToken, verPerfil)
route.get("/:id", verificarToken, obtenerUserPorId);

module.exports = route;
    