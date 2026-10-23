const { Router } = require("express");
const { register, login, crearPublicacion, editarPublicacion, eliminarPublicacion, darLike, quitarLike, getComentarios, crearComentario} = require("../controllers/Auth.controller.js");
const { verificarToken } = require("../middelwares/Auth.middleware.js");

const route = Router()

route.post('/register', register)
route.post('/login', login)
route.post('/publicaciones', verificarToken, crearPublicacion)
route.put('/publicaciones/:id', verificarToken, editarPublicacion)
route.delete('/publicaciones/:id', verificarToken, eliminarPublicacion)
route.post('/publicaciones/:id/like', verificarToken, darLike)
route.delete('/publicaciones/:id/like', verificarToken, quitarLike)
route.get('/publicaciones/:id/comentarios', verificarToken, getComentarios)
route.post('/publicaciones/:id/comentarios', verificarToken, crearComentario)


module.exports = route;