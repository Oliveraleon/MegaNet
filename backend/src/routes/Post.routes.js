const { Router } = require("express");
const { getUserPosts, getPostByUser, crearPublicacion, editarPublicacion, eliminarPublicacion, darLike, quitarLike, getComentarios, crearComentario, eliminarComentario} = require("../controllers/Post.controller");
const { verificarToken } = require("../middelwares/Auth.middleware.js"); 
const { subirImagen } = require("../middelwares/upload.js");

const route = Router();

route.get('/getUserPosts', verificarToken, getUserPosts);
route.get('/user/:id', verificarToken, getPostByUser);
route.post('/publicaciones', verificarToken, subirImagen, crearPublicacion)
route.put('/publicaciones/:id', verificarToken, editarPublicacion)
route.delete('/publicaciones/:id', verificarToken, eliminarPublicacion)
route.post('/publicaciones/:id/like', verificarToken, darLike)
route.delete('/publicaciones/:id/like', verificarToken, quitarLike)
route.get('/publicaciones/:id/comentarios', verificarToken, getComentarios)
route.post('/publicaciones/:id/comentarios', verificarToken, crearComentario)
route.delete('/publicaciones/:postId/comentarios/:comentarioId', verificarToken, eliminarComentario)

module.exports = route;