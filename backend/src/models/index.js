const Usuarios = require("./Usuarios.models.js");
const Publicaciones = require("./Publicaciones.models.js");
const Seguidores = require("./Seguidores.models.js");


Usuarios.hasMany(Publicaciones, { foreignKey: "userId", as: "publicaciones" });
Publicaciones.belongsTo(Usuarios, { foreignKey: "userId", as: "autor" });


Seguidores.belongsTo(Usuarios, { foreignKey: "followerId", as: "seguidor" });
Seguidores.belongsTo(Usuarios, { foreignKey: "followedId", as: "seguido" });

module.exports = { Usuarios, Publicaciones, Seguidores };