const Usuarios = require("./Usuarios.models.js");
const Publicaciones = require("./Publicaciones.models.js");
const Seguidores = require("./Seguidores.models.js");
const Reacciones = require("./Reacciones.models.js");
const Comentarios = require("./Comentarios.models.js");

Usuarios.hasMany(Publicaciones, { foreignKey: "userId", as: "publicaciones" });
Publicaciones.belongsTo(Usuarios, { foreignKey: "userId", as: "autor" });

Usuarios.hasMany(Reacciones, { foreignKey: "userId" });
Publicaciones.hasMany(Reacciones, { foreignKey: "postId" });

Usuarios.hasMany(Comentarios, { foreignKey: "userId" });
Publicaciones.hasMany(Comentarios, { foreignKey: "postId" });
Comentarios.belongsTo(Usuarios, { foreignKey: "userId", as: "autor" });

module.exports = { 
    Usuarios, 
    Publicaciones, 
    Seguidores, 
    Reacciones, 
    Comentarios 
};