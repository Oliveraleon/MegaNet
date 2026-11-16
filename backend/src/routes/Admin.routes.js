const express = require("express");
const router = express.Router();
const { obtenerTodosLosUsuarios, adminEliminarPublicacion, adminEliminarComentario } = require("../controllers/Admin.controller.js");
const { verificarToken, verificarRol } = require("../middelwares/Auth.middleware.js");

router.get("/usuarios", verificarToken, verificarRol, obtenerTodosLosUsuarios);
router.delete("/publicaciones/:id", verificarToken, verificarRol, adminEliminarPublicacion);
router.delete("/comentarios/:comentarioId", verificarToken, verificarRol, adminEliminarComentario);

module.exports = router;