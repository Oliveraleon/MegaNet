const { Router } = require("express");
const { register } = require("../controllers/Auth.controller.js");

const route = Router()

route.post('/register', register)

module.exports = route;