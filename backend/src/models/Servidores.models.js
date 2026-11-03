const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

const Servidores = sequelize.define(
    "Servidores",
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
        imagen:{
            type: DataTypes.STRING,
        },
    },
    {
        tableName: "Servidores",
        timestamps: false,
    },
);


module.exports = Servidores;