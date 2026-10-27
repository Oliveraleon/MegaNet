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
        userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
},
    postId: {
    type: DataTypes.INTEGER,
    allowNull: true,
},
activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
},
    },
    {
        tableName: "Comentarios",
        timestamps: false,
    }
);

module.exports = Comentarios;

