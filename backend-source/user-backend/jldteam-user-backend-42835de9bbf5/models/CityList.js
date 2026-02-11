const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const CountryList = require('./CountryList');
const StateList = require('./StateList');


const tableName = 'city_list';

const CityList = sequelize.define('CityList', {
    city_name: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    latitude: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    longitude: {
        type: Sequelize.STRING,
        allowNull: true,
    }
}, {
    tableName
});

/** Country Join */
CityList.belongsTo(CountryList, {
    foreignKey: 'country_id'
});
CountryList.hasMany(CityList, {
    foreignKey: 'country_id'
});

/** State Join */
CityList.belongsTo(StateList, {
    foreignKey: 'state_id'
});
StateList.hasMany(CityList, {
    foreignKey: 'state_id'
});


module.exports = CityList;