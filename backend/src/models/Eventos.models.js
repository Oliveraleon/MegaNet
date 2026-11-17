const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

// Eventos del calendario de un grupo
const Eventos = sequelize.define(
    "Eventos",
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        grupoId:{
            type: DataTypes.INTEGER,
        },
        servidorId:{
            type: DataTypes.INTEGER,
        },
        creadorId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        titulo:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        descripcion:{
            type: DataTypes.STRING,
        },
        fecha:{
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        tableName: "Eventos",
        timestamps: false,
    },
);

module.exports = Eventos;
