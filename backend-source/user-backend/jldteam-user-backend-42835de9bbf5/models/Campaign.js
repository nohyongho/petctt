const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Brand = require('./Brand');
const CountryList = require('./CountryList');


const tableName = 'campaign';

const Campaign = sequelize.define('Campaign', {
    name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
            len: [1, 100]
        },
    },
    start_date: {
        type: Sequelize.DATE,
    },
    end_date: {
        type: Sequelize.DATE,
    },
    status: {
        type: Sequelize.ENUM('started', 'stopped','expired', 'paused', 'pending'),
        defaultValue: 'pending',
    },

    description: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    image: {
        type: Sequelize.STRING,
        allowNull: true,
    },
}, {
        tableName
    });

/** Brand Join */
Campaign.belongsTo(Brand, {
    foreignKey: 'brand_id'
});
Brand.hasMany(Campaign, {
    foreignKey: 'brand_id'
});

/** Country Join */
Campaign.belongsTo(CountryList, {
    foreignKey: 'country_id'
});
CountryList.hasMany(Campaign, {
    foreignKey: 'country_id'
});


module.exports = Campaign;