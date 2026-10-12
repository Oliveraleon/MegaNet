const Usuario = require("./Usuarios.models.js");
const Perfil = require("./Perfiles.models.js");

Usuario.hasOne(Perfil, {
    foreignKey: "userId",
    as: "perfil",
});

Perfil.belongsTo(Usuario, {
    foreignKey: "userId",
    as: "usuario",
});

module.exports = { Usuario, Perfil };