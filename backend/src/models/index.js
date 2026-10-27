
const Usuario = require("./Usuarios.models.js");
const Perfil = require("./Perfiles.models.js");
const Publicaciones = require("./Publicaciones.models.js");
const Comentarios = require("./Comentarios.models.js");
const Reacciones = require("./Reacciones.models.js");

// Relaciones entre usuarios y perfiles
Usuario.hasOne(Perfil, {
    foreignKey: "userId",
    as: "perfil",
});

Perfil.belongsTo(Usuario, {
    foreignKey: "userId",
    as: "usuario",
});

// Relaciones entre usuarios y publicaciones
Usuario.hasMany(Publicaciones, {
    foreignKey: "userId",
    as: "publicaciones",
});

Publicaciones.belongsTo(Usuario, {
    foreignKey: "userId",
    as: "autor",
});

// Relaciones entre publicaciones y comentarios
Publicaciones.hasMany(Comentarios, {
    foreignKey: "postId",
    as: "comentarios",
});

Comentarios.belongsTo(Publicaciones, {
    foreignKey: "postId",
    as: "publicacion",
});

// Relaciones entre usuarios y comentarios
Usuario.hasMany(Comentarios, {
    foreignKey: "userId",
    as: "comentarios",
});

Comentarios.belongsTo(Usuario, {
    foreignKey: "userId",
    as: "autor",
});

// Relaciones entre publicaciones y reacciones
Publicaciones.hasMany(Reacciones, {
    foreignKey: "postId",
    as: "reacciones",
});

Reacciones.belongsTo(Publicaciones, {
    foreignKey: "postId",
    as: "publicacion",
});

// Relaciones entre usuarios y reacciones
Usuario.hasMany(Reacciones, {
    foreignKey: "userId",
    as: "reacciones",
});

Reacciones.belongsTo(Usuario, {
    foreignKey: "userId",
    as: "usuario",
});

module.exports = {
    Usuario,
    Perfil,
    Publicaciones,
    Comentarios,
    Reacciones,
};
