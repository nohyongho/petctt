const Sequelize = require('sequelize');
const sequelize = require('../config/database');


const tableName = 'country_list';

const CountryList = sequelize.define('CountryList', {
    country_name: {
        type: Sequelize.STRING(80),
        allowNull: true,
    },
    sort_name: {
        type: Sequelize.STRING(15),
        allowNull: true,
    },
    phone_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
    },
    flag_image: {
        type: Sequelize.TEXT('medium'),
        allowNull: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci'
    }, 
    latitude: {
        type: Sequelize.STRING(50),
        allowNull: true,
    },
    longitude: {
        type: Sequelize.STRING(50),
        allowNull: true,
    }
}, {
        tableName
    });


module.exports = CountryList;