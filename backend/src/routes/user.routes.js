
const { Router } = require("express");
const { obtenerPerfil, actualizarPerfil, getFeed, getUsuarios, seguir, dejarDeSeguir, getSeguidores, getSiguiendo, buscarUser, obtenerUserPorId, actualizarContraseña, eliminarCuenta, recuperarCuenta, reiniciarContraseña} = require("../controllers/User.controller.js");
const { verificarToken, tokenOpcional } = require("../middelwares/Auth.middleware.js");

const route = Router();

route.get("/profile", verificarToken, obtenerPerfil);
route.patch("/profile", verificarToken,actualizarPerfil)
route.get('/feed', tokenOpcional, getFeed)
route.get('/usuarios', verificarToken, getUsuarios)
route.get('/seguidores/', verificarToken, getSeguidores)
route.get('/seguidores/:id', verificarToken, getSeguidores)
route.get('/siguiendo/', verificarToken, getSiguiendo)
route.get('/siguiendo/:id', verificarToken, getSiguiendo)
route.post('/seguir/:id', verificarToken, seguir)
route.delete('/seguir/:id', verificarToken, dejarDeSeguir)
route.get("/buscar",verificarToken,buscarUser)
route.get("/:id", verificarToken, obtenerUserPorId);
route.patch("/password", verificarToken, actualizarContraseña);
route.delete("/eliminar",verificarToken,eliminarCuenta)
route.post("/recuperarCuenta", recuperarCuenta)
route.post("/reiniciarContrasena", reiniciarContraseña)

module.exports = route;
    