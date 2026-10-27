
const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

const Reacciones = sequelize.define(
    "Reacciones",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        type: {
            type: DataTypes.ENUM("like", "dislike"),
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "Reacciones",
        timestamps: false,
    }
);

module.exports = Reacciones;
