const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Country = require('../models/CountryList');


const tableName = 'currency';

const Currency = sequelize.define('Currency', {
    name: {
        type: Sequelize.STRING,
        unique: 'tak_unique',
    },
    symbol: {
        type: Sequelize.STRING,
        unique: 'tak_unique',
    },
    sign: {
        type: Sequelize.TEXT,
        charset: 'utf8mb4'
    }

}, {
    tableName
});
/** Country Join */
Currency.belongsTo(Country, {
    foreignKey: 'country_id'
});
Country.hasMany(Currency, {
    foreignKey: 'country_id'
});

module.exports = Currency;