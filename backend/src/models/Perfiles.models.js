const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

const Perfiles = sequelize.define(
    "Perfiles", 
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description:{
            type: DataTypes.STRING,
        },
        profilePicture:{
            type: DataTypes.STRING,
        },
        profileBanner:{
            type: DataTypes.STRING,
        },
        userId:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Usuarios",
                key: "id",
            },
        },
    },
    {
        tableName: "Perfiles",
        timestamps: false,
    },
);

module.exports = Perfiles;