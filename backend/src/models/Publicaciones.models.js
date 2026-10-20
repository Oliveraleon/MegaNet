const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

const Publicaciones = sequelize.define(
    "Publicaciones", 
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        content:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        multimedia:{
            type: DataTypes.STRING,
        },
        creationDate:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        privacy:{
            type: DataTypes.ENUM("public", "private", "friends"),
        },
        usuarioId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    },
    {
        tableName: "Publicaciones",
        timestamps: false,
    },
);

module.exports = Publicaciones;