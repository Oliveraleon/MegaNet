const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

const Seguidores = sequelize.define(
    "Seguidores",
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        followerId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        followedId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "aceptado"
        }
    },
    {
        tableName: "Seguidores",
        timestamps: false,
        indexes: [
            { unique: true, fields: ["followerId", "followedId"] },
        ],
    },
);

module.exports = Seguidores;