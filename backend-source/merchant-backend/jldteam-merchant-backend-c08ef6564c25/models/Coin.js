const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');


const tableName = 'coins';

const Coin = sequelize.define('Coin', {
 
    
    
    name: {
        type: Sequelize.STRING,
    },
    
    symbol: {
        type: Sequelize.STRING,
    },

    image_url: {
        type: Sequelize.STRING,
    },

    web_url: {
        type: Sequelize.STRING,
    },

    daemon_api_url: {
        type: Sequelize.STRING,
    },

    status: {
        type: Sequelize.INTEGER,
    },
    soft_delete: {
        type: Sequelize.INTEGER,
    },




}, {
    tableName
});




module.exports = Coin;