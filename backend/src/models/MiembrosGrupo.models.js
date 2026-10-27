const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

const MiembrosGrupo = sequelize.define(
    "MiembrosGrupo",
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        grupoId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "MiembrosGrupo",
        timestamps: false,
        indexes: [
            { unique: true, fields: ["grupoId", "userId"] },
        ],
    },
);

module.exports = MiembrosGrupo;