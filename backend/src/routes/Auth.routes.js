const { Router } = require("express");
const { register, login, me  } = require("../controllers/Auth.controller.js");
const { verificarToken } = require("../middelwares/Auth.middleware.js");

const route = Router()

route.post('/register', register)
route.post('/login', login)
route.get('/me', verificarToken, me)

module.exports = route;