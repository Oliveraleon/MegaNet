const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

const Grupos = sequelize.define(
    "Grupos",
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        ownerId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "Grupos",
        timestamps: false,
    },
);

module.exports = Grupos;