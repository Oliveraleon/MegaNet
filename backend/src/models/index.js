const Usuarios = require("./Usuarios.models.js");
const Publicaciones = require("./Publicaciones.models.js");
const Seguidores = require("./Seguidores.models.js");
const Reacciones = require("./Reacciones.models.js");
const Comentarios = require("./Comentarios.models.js");
const Amistades = require("./Amistades.models.js");
const Mensajes = require("./Mensajes.models.js");
const Grupos = require("./Grupos.models.js");
const MiembrosGrupo = require("./MiembrosGrupo.models.js");
const Servidores = require("./Servidores.models.js");
const MiembrosServidor = require("./MiembrosServidor.models.js");
const Canales = require("./Canales.models.js");
const Eventos = require("./Eventos.models.js");
const Notificaciones = require("./Notificaciones.models.js");

Usuarios.hasMany(Publicaciones, { foreignKey: "userId", as: "publicaciones" });
Publicaciones.belongsTo(Usuarios, { foreignKey: "userId", as: "autor" });

Usuarios.belongsToMany(Usuarios, { through: Seguidores, as: "Following", foreignKey: "followerId", otherKey: "followedId" });
Usuarios.belongsToMany(Usuarios, { through: Seguidores, as: "Followers", foreignKey: "followedId", otherKey: "followerId" });

Usuarios.hasMany(Reacciones, { foreignKey: "userId", as: "reacciones" });
Reacciones.belongsTo(Usuarios, { foreignKey: "userId", as: "usuario" });

Publicaciones.hasMany(Reacciones, { foreignKey: "postId", as: "reacciones" });
Reacciones.belongsTo(Publicaciones, { foreignKey: "postId", as: "publicacion" });

Usuarios.hasMany(Comentarios, { foreignKey: "userId", as: "comentarios" });
Comentarios.belongsTo(Usuarios, { foreignKey: "userId", as: "autorComentario" });

Publicaciones.hasMany(Comentarios, { foreignKey: "postId", as: "comentarios" });
Comentarios.belongsTo(Publicaciones, { foreignKey: "postId", as: "publicacion" });

Usuarios.hasMany(Reacciones, { foreignKey: "userId" });
Publicaciones.hasMany(Reacciones, { foreignKey: "postId" });

Usuarios.hasMany(Comentarios, { foreignKey: "userId" });
Publicaciones.hasMany(Comentarios, { foreignKey: "postId" });
Comentarios.belongsTo(Usuarios, { foreignKey: "userId", as: "autor" });
Mensajes.belongsTo(Usuarios, { foreignKey: "senderId", as: "autor" });
MiembrosGrupo.belongsTo(Usuarios, { foreignKey: "userId", as: "usuario" });
MiembrosServidor.belongsTo(Usuarios, { foreignKey: "userId", as: "usuario" });
Eventos.belongsTo(Usuarios, { foreignKey: "creadorId", as: "creador" });

module.exports = { 
    Usuarios, 
    Publicaciones, 
    Seguidores, 
    Reacciones, 
    Comentarios,
    Amistades,
    Mensajes,
    Grupos,
    MiembrosGrupo,
    Servidores,
    MiembrosServidor,
    Canales,
    Eventos,
    Notificaciones
};