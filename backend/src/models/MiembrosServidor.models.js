const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

const MiembrosServidor = sequelize.define(
    "MiembrosServidor",
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        servidorId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // Canal de voz en el que esta conectado (null = no esta en ninguno)
        canalVozId:{
            type: DataTypes.INTEGER,
        },
    },
    {
        tableName: "MiembrosServidor",
        timestamps: false,
        indexes: [
            { unique: true, fields: ["servidorId", "userId"] },
        ],
    },
);

module.exports = MiembrosServidor;