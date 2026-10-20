const { Router } = require("express");
const { getUserPosts } = require("../controllers/Post.controller");
const { verificarToken } = require("../middelwares/Auth.middleware.js"); 

const route = Router();

route.get('/getUserPosts', verificarToken, getUserPosts);

module.exports = route;