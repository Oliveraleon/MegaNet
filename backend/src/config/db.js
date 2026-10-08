const { Sequelize } = require ("sequelize");

const sequelize = new Sequelize ("MegaNet", "root", "123",{
    host: "localhost",
    dialect: "mysql",
    loggin: false,
});

module.exports = {
    sequelize,
};