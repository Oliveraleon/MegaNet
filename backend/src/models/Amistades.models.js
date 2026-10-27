const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

const Amistades = sequelize.define(
    "Amistades",
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        senderId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        receiverId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status:{
            type: DataTypes.ENUM("pendiente", "aceptada"),
            allowNull: false,
            defaultValue: "pendiente",
        },
    },
    {
        tableName: "Amistades",
        timestamps: false,
        indexes: [
            { unique: true, fields: ["senderId", "receiverId"] },
        ],
    },
);

module.exports = Amistades;