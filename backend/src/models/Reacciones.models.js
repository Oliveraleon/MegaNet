const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

const Reacciones = sequelize.define(
    "Reacciones",
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        type:{
            type: DataTypes.ENUM("like","dislike"),
            allowNull: false,
        },
    },
    {
        tableName: "Reacciones",
        timestamps: false,
    }
);

module.exports = Reacciones;