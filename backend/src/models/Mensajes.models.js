const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

// Un mensaje puede ser privado (receiverId), de un grupo (grupoId)
// o de un canal de texto de un servidor (canalId). Solo se completa uno de los tres.
const Mensajes = sequelize.define(
    "Mensajes",
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        content:{
            type: DataTypes.TEXT,
            allowNull: false,
        },
        creationDate:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        senderId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        receiverId:{
            type: DataTypes.INTEGER,
        },
        grupoId:{
            type: DataTypes.INTEGER,
        },
        canalId:{
            type: DataTypes.INTEGER,
        },
        archivo:{
            type: DataTypes.STRING,
        },
    },
    {
        tableName: "Mensajes",
        timestamps: false,
    },
);

module.exports = Mensajes;