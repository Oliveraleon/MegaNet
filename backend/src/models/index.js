const Usuarios = require("./usuarios.models.js");
const Publicaciones = require("./Publicaciones.models.js");

Usuarios.hasMany(Publicaciones, { foreignKey: "usuarioId" });


Publicaciones.belongsTo(Usuarios, { foreignKey: "usuarioId" });

module.exports = {
    Usuarios,
    Publicaciones,
};