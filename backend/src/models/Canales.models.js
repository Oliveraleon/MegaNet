const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

const Canales = sequelize.define(
    "Canales",
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        servidorId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        type:{
            type: DataTypes.ENUM("texto", "voz"),
            allowNull: false,
            defaultValue: "texto",
        },
    },
    {
        tableName: "Canales",
        timestamps: false,
    },
);

module.exports = Canales;