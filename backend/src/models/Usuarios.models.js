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
        username:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
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
        description:{
            type: DataTypes.STRING,
        },
        profilePicture:{
            type: DataTypes.TEXT,
        },
        profileBanner:{
            type: DataTypes.TEXT,
        },
        followers:{
            type: DataTypes.INTEGER
        },
        following:{
            type: DataTypes.INTEGER
        },
        rol:{
            type: DataTypes.ENUM("user", "admin"),
            allowNull: false,
            defaultValue: "user"
        }
    },
    {
        tableName: "Usuarios",
        timestamps: false,
    },
);

module.exports = Usuarios;