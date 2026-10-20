const { Sequelize } = require ("sequelize");

const sequelize = new Sequelize ("MegaNet", "root", "",{
    host: "localhost",
    dialect: "mysql",
    logging: false,
});

module.exports = {
    sequelize,
};