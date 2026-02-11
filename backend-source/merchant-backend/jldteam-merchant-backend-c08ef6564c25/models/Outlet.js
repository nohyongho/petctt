const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Brand = require('./Brand');
const CountryList = require('./CountryList');
const StateList = require('./StateList');
const CityList = require('./CityList');
const User = require('./User');
const Category = require('./Categories');
//const Coupon = require('./Coupon');

const tableName = 'outlet';

class Outlet extends Sequelize.Model {};

Outlet.init({
    outlet_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
            len: [1, 100]
        }
    },
    postal_code: {
        type: Sequelize.STRING(10),
        allowNull: true,
    },
    address: {
        type: Sequelize.STRING(100),
        allowNull: true,
    },
    phone_number: {
        type: Sequelize.STRING(14),
        allowNull: true,
    },
    // area: {
    //     type: Sequelize.DECIMAL(16, 4),
    //     allowNull: false
    // },
    latitude: {
        type: Sequelize.STRING(255),
        allowNull: true,
    },
    longitude: {
        type: Sequelize.STRING(255),
        allowNull: true,
    },
    location: {
        type: Sequelize.GEOMETRY('POINT'),
    },
    brand_id: {
        type: Sequelize.INTEGER(255),

    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: true
    },
    is_countrywide: {
        type: Sequelize.BOOLEAN,

    },
    is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: true
    },
    image: {
        type: Sequelize.STRING(),

    },

    street_name: {
        type: Sequelize.STRING(),

    },
    city_name: {
        type: Sequelize.STRING(),

    },
    state_name: {
        type: Sequelize.STRING(),

    },
    country_code: {
        type: Sequelize.STRING(),

    },
    nearby_couponrange: {
        type: Sequelize.STRING(),

    },



}, {
    sequelize,
    tableName
});

/** Brand Join */
//Brand.hasMany(Outlet, {foreignKey: 'brand_id'});


/** Country Join */
Outlet.belongsTo(CountryList, { foreignKey: 'country_id' });
CountryList.hasMany(Outlet, { foreignKey: 'country_id' });

/** State Join */
// Outlet.belongsTo(StateList, {foreignKey: 'state_id'});
// StateList.hasMany(Outlet, {foreignKey: 'state_id'});

/** City Join */
Outlet.belongsTo(CityList, { foreignKey: 'city_id' });
CityList.hasMany(Outlet, { foreignKey: 'city_id' });

/** User Join */
Outlet.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Outlet, { foreignKey: 'user_id' });



module.exports = Outlet;