
const { Router } = require("express");

const {
    obtenerPublicaciones,
    crearPublicacion,
    eliminarPublicacion,
} = require("../controllers/Publicaciones.controller.js");

const verificarToken = require("../middelwares/auth.js");
const { subirImagen } = require("../middelwares/upload.js");

const route = Router();

// Ver publicaciones activas
route.get("/", obtenerPublicaciones);

// Crear publicación: requiere sesión y permite adjuntar una imagen
route.post("/", verificarToken, subirImagen, crearPublicacion);

// Desactivar una publicación propia
route.delete("/:id", verificarToken, eliminarPublicacion);

module.exports = route;
