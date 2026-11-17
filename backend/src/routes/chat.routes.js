const { Router } = require("express");
const { getContactos, getMensajesPrivados, enviarMensajePrivado, getGrupos, crearGrupo, getGrupo, agregarMiembroGrupo, salirDelGrupo, getMensajesGrupo, enviarMensajeGrupo, getServidores, crearServidor, getServidor, agregarMiembroServidor, crearCanal, getMensajesCanal, enviarMensajeCanal, editarServidor, salirDelServidor, eliminarServidor, eliminarGrupo, eliminarMensaje, getEventos, crearEvento, eliminarEvento, getEventosServidor, crearEventoServidor, eliminarMiembroGrupo, pasarPropiedadGrupo, eliminarMiembroServidor, pasarPropiedadServidor } = require("../controllers/Chat.controller.js");
const { verificarToken } = require("../middelwares/Auth.middleware.js");
const { subirImagen, subirArchivo } = require("../middelwares/upload.js");

const route = Router();

route.get('/contactos', verificarToken, getContactos)
route.get('/privado/:id', verificarToken, getMensajesPrivados)
route.post('/privado/:id', verificarToken, subirArchivo, enviarMensajePrivado)
route.get('/grupos', verificarToken, getGrupos)
route.post('/grupos', verificarToken, crearGrupo)
route.get('/grupos/:id', verificarToken, getGrupo)
route.delete('/grupos/:id', verificarToken, eliminarGrupo)
route.post('/grupos/:id/miembros', verificarToken, agregarMiembroGrupo)
route.delete('/grupos/:id/miembros', verificarToken, salirDelGrupo)
route.delete('/grupos/:id/miembros/:userId', verificarToken, eliminarMiembroGrupo)
route.put('/grupos/:id/propietario', verificarToken, pasarPropiedadGrupo)
route.get('/grupos/:id/mensajes', verificarToken, getMensajesGrupo)
route.post('/grupos/:id/mensajes', verificarToken, subirArchivo, enviarMensajeGrupo)
route.get('/grupos/:id/eventos', verificarToken, getEventos)
route.post('/grupos/:id/eventos', verificarToken, crearEvento)
route.delete('/eventos/:id', verificarToken, eliminarEvento)
route.delete('/mensajes/:id', verificarToken, eliminarMensaje)
route.get('/servidores', verificarToken, getServidores)
route.post('/servidores', verificarToken, crearServidor)
route.get('/servidores/:id', verificarToken, getServidor)
route.put('/servidores/:id', verificarToken, subirImagen, editarServidor)
route.delete('/servidores/:id', verificarToken, eliminarServidor)
route.post('/servidores/:id/miembros', verificarToken, agregarMiembroServidor)
route.delete('/servidores/:id/miembros', verificarToken, salirDelServidor)
route.delete('/servidores/:id/miembros/:userId', verificarToken, eliminarMiembroServidor)
route.put('/servidores/:id/propietario', verificarToken, pasarPropiedadServidor)
route.get('/servidores/:id/eventos', verificarToken, getEventosServidor)
route.post('/servidores/:id/eventos', verificarToken, crearEventoServidor)
route.post('/servidores/:id/canales', verificarToken, crearCanal)
route.get('/canales/:id/mensajes', verificarToken, getMensajesCanal)
route.post('/canales/:id/mensajes', verificarToken, subirArchivo, enviarMensajeCanal)


module.exports = route;