const { Router } = require("express");
const { getUserPosts, getPostByUser} = require("../controllers/Post.controller");
const { verificarToken } = require("../middelwares/Auth.middleware.js"); 

const route = Router();

route.get('/getUserPosts', verificarToken, getUserPosts);
route.get('/user/:id', verificarToken, getPostByUser);

module.exports = route;