const { Router } = require("express");
const { register, login} = require("../controllers/Auth.controller.js");

const route = Router()

route.post('/register', register)
route.post('/login', login)

module.exports = route;