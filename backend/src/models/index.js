const Usuarios = require("./usuarios.models.js");
const Publicaciones = require("./Publicaciones.models.js");
const Seguidores = require("./Seguidores.models.js");

Usuarios.hasMany(Publicaciones, { foreignKey: "userId", as: "publicaciones" });
Publicaciones.belongsTo(Usuarios, { foreignKey: "userId", as: "autor" });

module.exports = {
    Usuarios,
    Publicaciones,
};