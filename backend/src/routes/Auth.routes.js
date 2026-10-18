const { Router } = require("express");
const { register, login, getFeed, getUsuarios, seguir, dejarDeSeguir, getSeguidores, getSiguiendo  } = require("../controllers/Auth.controller.js");
const { verificarToken, tokenOpcional } = require("../middelwares/Auth.middleware.js");

const route = Router()

route.post('/register', register)
route.post('/login', login)
route.get('/feed', tokenOpcional, getFeed)
route.get('/usuarios', verificarToken, getUsuarios)
route.get('/seguidores', verificarToken, getSeguidores)
route.get('/siguiendo', verificarToken, getSiguiendo)
route.post('/seguir/:id', verificarToken, seguir)
route.delete('/seguir/:id', verificarToken, dejarDeSeguir)

module.exports = route;