const { Sequelize } = require ("sequelize");

const sequelize = new Sequelize ("megaNet", "root", "",{
    host: "localhost",
    dialect: "mysql",
    logging: false,
});

module.exports = {
    sequelize,
};