const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

const Comentarios = sequelize.define(
    "Comentarios",
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        text:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        creationDate:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "Comentarios",
        timestamps: false,
    }
);

module.exports = Comentarios;

