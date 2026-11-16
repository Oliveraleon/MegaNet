const { Router } = require("express");
const { getUserPosts, getPostByUser, crearPublicacion} = require("../controllers/Post.controller");
const { verificarToken } = require("../middelwares/Auth.middleware.js"); 
const { subirImagen } = require("../middelwares/upload.js");

const route = Router();

route.get('/getUserPosts', verificarToken, getUserPosts);
route.get('/user/:id', verificarToken, getPostByUser);
route.post('/createPost', verificarToken, subirImagen, crearPublicacion);

module.exports = route;