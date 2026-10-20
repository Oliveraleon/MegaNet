const Usuarios = require("./Usuarios.models.js");
const Publicaciones = require("./Publicaciones.models.js");
const Seguidores = require("./Seguidores.models.js");
const Reacciones = require("./Reacciones.models.js");
const Comentarios = require("./Comentarios.models.js");
const Usuarios = require("./usuarios.models.js");
const Publicaciones = require("./Publicaciones.models.js");

// Un usuario tiene muchas publicaciones
Usuarios.hasMany(Publicaciones, { foreignKey: "userId", as: "publicaciones" });
Publicaciones.belongsTo(Usuarios, { foreignKey: "userId", as: "autor" });

// Cada reaccion (like) es de un usuario y de una publicacion
Usuarios.hasMany(Reacciones, { foreignKey: "userId" });
Publicaciones.hasMany(Reacciones, { foreignKey: "postId" });

// Cada comentario es de un usuario y de una publicacion
Usuarios.hasMany(Comentarios, { foreignKey: "userId" });
Publicaciones.hasMany(Comentarios, { foreignKey: "postId" });
Comentarios.belongsTo(Usuarios, { foreignKey: "userId", as: "autor" });
module.exports = { Usuarios, Publicaciones, Seguidores, Reacciones, Comentarios };
Usuarios.hasMany(Publicaciones, { foreignKey: "userId", as: "publicaciones" });
Publicaciones.belongsTo(Usuarios, { foreignKey: "userId", as: "autor" });

module.exports = {
    Usuarios,
    Publicaciones,
};
