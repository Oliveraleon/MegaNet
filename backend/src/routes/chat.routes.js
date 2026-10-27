const { Router } = require("express");
const { getContactos, getMensajesPrivados, enviarMensajePrivado, getGrupos, crearGrupo, getGrupo, agregarMiembroGrupo, salirDelGrupo, getMensajesGrupo, enviarMensajeGrupo, getServidores, crearServidor, getServidor, agregarMiembroServidor, crearCanal, getMensajesCanal, enviarMensajeCanal, entrarVoz, salirVoz } = require("../controllers/Chat.controller.js");
const { verificarToken } = require("../middelwares/Auth.middleware.js");

const route = Router();

// Chat privado
route.get('/contactos', verificarToken, getContactos)
route.get('/privado/:id', verificarToken, getMensajesPrivados)
route.post('/privado/:id', verificarToken, enviarMensajePrivado)

// Grupos
route.get('/grupos', verificarToken, getGrupos)
route.post('/grupos', verificarToken, crearGrupo)
route.get('/grupos/:id', verificarToken, getGrupo)
route.post('/grupos/:id/miembros', verificarToken, agregarMiembroGrupo)
route.delete('/grupos/:id/miembros', verificarToken, salirDelGrupo)
route.get('/grupos/:id/mensajes', verificarToken, getMensajesGrupo)
route.post('/grupos/:id/mensajes', verificarToken, enviarMensajeGrupo)

// Servidores y canales
route.get('/servidores', verificarToken, getServidores)
route.post('/servidores', verificarToken, crearServidor)
route.get('/servidores/:id', verificarToken, getServidor)
route.post('/servidores/:id/miembros', verificarToken, agregarMiembroServidor)
route.post('/servidores/:id/canales', verificarToken, crearCanal)
route.get('/canales/:id/mensajes', verificarToken, getMensajesCanal)
route.post('/canales/:id/mensajes', verificarToken, enviarMensajeCanal)
route.post('/canales/:id/voz', verificarToken, entrarVoz)
route.delete('/canales/:id/voz', verificarToken, salirVoz)

module.exports = route;