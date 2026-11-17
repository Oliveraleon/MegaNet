const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

// Avisos que le llegan a un usuario (campanita)
const Notificaciones = sequelize.define(
    "Notificaciones",
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        texto:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        link:{
            type: DataTypes.STRING,
        },
        leida:{
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        fecha:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        eventoId:{
            type: DataTypes.INTEGER,
        },
    },
    {
        tableName: "Notificaciones",
        timestamps: false,
    },
);

module.exports = Notificaciones;
