const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

const Usuarios = sequelize.define(
    "Usuarios",
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password:{
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "Usuarios",
        timestamps: false,
    },
);

module.exports = Usuarios;