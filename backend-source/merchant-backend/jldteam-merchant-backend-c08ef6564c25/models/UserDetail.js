const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const CountryList = require('./CountryList');
const StateList = require('./StateList');
const CityList = require('./CityList');

const tableName = 'user_detail';

const UserDetail = sequelize.define('UserDetail', {
    postal_code: {
        type: Sequelize.STRING(6),
        allowNull: true,
    },
    address: {
        type: Sequelize.STRING(100),
        allowNull: true,
    },
    image: {
        type: Sequelize.STRING,
        allowNull: true,
    }

}, {
    tableName
});

/** User Join */
UserDetail.belongsTo(User, {
    foreignKey: 'user_id'
});
User.hasMany(UserDetail, {
    foreignKey: 'user_id'
});

/** Country Join */
UserDetail.belongsTo(CountryList, {
    foreignKey: 'country_id'
});
CountryList.hasMany(UserDetail, {
    foreignKey: 'country_id'
});

/** State Join */
UserDetail.belongsTo(StateList, {
    foreignKey: 'state_id'
});
StateList.hasMany(UserDetail, {
    foreignKey: 'state_id'
});

/** City Join */
UserDetail.belongsTo(CityList, {
    foreignKey: 'city_id'
});
CityList.hasMany(UserDetail, {
    foreignKey: 'city_id'
});

module.exports = UserDetail;