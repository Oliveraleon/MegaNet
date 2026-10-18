const { Router } = require("express");
const { getFeed, listarUsuarios, seguir, dejarDeSeguir, seguidores, siguiendo,} = require("../controllers/Social.controller.js");
const { verificarToken, tokenOpcional } = require("../middelwares/Auth.middleware.js");

const route = Router()

route.get('/feed', tokenOpcional, getFeed)
route.get('/usuarios', verificarToken, listarUsuarios)
route.get('/seguidores', verificarToken, seguidores)
route.get('/siguiendo', verificarToken, siguiendo)
route.post('/seguir/:id', verificarToken, seguir)
route.delete('/seguir/:id', verificarToken, dejarDeSeguir)

module.exports = route;