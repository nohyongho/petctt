const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const CountryList = require('./CountryList');
const StateList = require('./StateList');
const CityList = require('./CityList');
const User = require('./User');

const tableName = 'user_address';

class UserAddress extends Sequelize.Model {}

UserAddress.init({

    addressId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id',
    },

    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'user_id',
    },

    countryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'country_id',
    },

    stateId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'state_id',
    },

    cityId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'city_id',
    },

    fullName: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "",
        field: 'full_name',
    },

    landLineNumber: {
        type: Sequelize.STRING(15),
        allowNull: true,
        field: 'land_line_number',
    },

    mobileNumber: {
        type: Sequelize.STRING(15),
        allowNull: true,
        field: 'mobile_number',
    },

    type: {
        type: Sequelize.ENUM('Home', 'Work', 'Hotel', 'Other'),
        defaultValue: 'Home',
        field: 'type',
    },

    cityName: {
        type: Sequelize.STRING(40),
        allowNull: true,
        field: 'city_name',
    },

    fullAddress: {
        type: Sequelize.STRING(300),
        allowNull: true,
        field: 'full_address',
    },

    flatNumber: {
        type: Sequelize.STRING(10),
        allowNull: true,
        field: 'flat_number',
    },

    floor: {
        type: Sequelize.STRING(4),
        allowNull: true,
        field: 'floor',
    },

    landmark: {
        type: Sequelize.STRING(45),
        allowNull: true,
        field: 'landmark',
    },

    buildingName: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: 'building_name',
    },

    postalCode: {
        type: Sequelize.STRING(10),
        allowNull: true,
        field: 'postal_code',
    },

    isDefault: {
        type: Sequelize.BOOLEAN,
        field: 'is_default',
    },

    isAddressDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'soft_delete',
    }



}, {
    sequelize,
    tableName
});

UserAddress.belongsTo(CountryList, {
    foreignKey: 'country_id'
});

UserAddress.belongsTo(StateList, {
    foreignKey: 'state_id'
});

UserAddress.belongsTo(CityList, {
    foreignKey: 'city_id'
});

UserAddress.belongsTo(User, {
    foreignKey: 'user_id'
});

User.hasMany(UserAddress, {
    foreignKey: 'user_id'
});


module.exports = UserAddress;