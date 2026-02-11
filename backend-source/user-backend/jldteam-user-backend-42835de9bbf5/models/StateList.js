const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const CountryList = require('./CountryList');


const tableName = 'state_list';

const StateList = sequelize.define('StateList', {
    state_name: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    state_code: {
        type: Sequelize.STRING,
        allowNull: true,
    }
}, {
    tableName
});

/** Country Join */
StateList.belongsTo(CountryList, {
    foreignKey: 'country_id'
});
CountryList.hasMany(StateList, {
    foreignKey: 'country_id'
});


module.exports = StateList;