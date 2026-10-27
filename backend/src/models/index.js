const Usuarios = require("./Usuarios.models.js");
const Publicaciones = require("./Publicaciones.models.js");
const Seguidores = require("./Seguidores.models.js");
const Reacciones = require("./Reacciones.models.js");
const Comentarios = require("./Comentarios.models.js");

Usuarios.hasMany(Publicaciones, { foreignKey: "userId", as: "publicaciones" });
Publicaciones.belongsTo(Usuarios, { foreignKey: "userId", as: "autor" });

Usuarios.hasMany(Reacciones, { foreignKey: "userId", as: "reacciones" });
Reacciones.belongsTo(Usuarios, { foreignKey: "userId", as: "usuario" });

Publicaciones.hasMany(Reacciones, { foreignKey: "postId", as: "reacciones" });
Reacciones.belongsTo(Publicaciones, { foreignKey: "postId", as: "publicacion" });


Usuarios.hasMany(Comentarios, { foreignKey: "userId", as: "comentarios" });
Comentarios.belongsTo(Usuarios, { foreignKey: "userId", as: "autor" });

Publicaciones.hasMany(Comentarios, { foreignKey: "postId", as: "comentarios" });
Comentarios.belongsTo(Publicaciones, { foreignKey: "postId", as: "publicacion" });

module.exports = { 
    Usuarios, 
    Publicaciones, 
    Seguidores, 
    Reacciones, 
    Comentarios 
};