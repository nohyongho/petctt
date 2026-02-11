const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Brand = require('./Brand');
const CountryList = require('./CountryList');
const StateList = require('./StateList');
const CityList = require('./CityList');
const User = require('./User');
const Category = require('./Categories');

const tableName = 'outlet';

class Outlet extends Sequelize.Model {}

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
    // altitude: {
    //     type: Sequelize.STRING(255),
    //     allowNull: true,
    // },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: true
    },
    is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: true
    },
    country_code: {
        type: Sequelize.STRING(5),
    },
    nearby_couponrange: {
        type: Sequelize.DOUBLE,
        allowNull: true
    }
}, {
    sequelize,
    tableName
});

/** Brand Join */
Outlet.belongsTo(Brand, {
    foreignKey: 'brand_id'
});
Brand.hasMany(Outlet, {
    foreignKey: 'brand_id'
});

/** Country Join */
Outlet.belongsTo(CountryList, {
    foreignKey: 'country_id'
});
CountryList.hasMany(Outlet, {
    foreignKey: 'country_id'
});

/** State Join */
Outlet.belongsTo(StateList, {
    foreignKey: 'state_id'
});
StateList.hasMany(Outlet, {
    foreignKey: 'state_id'
});

/** City Join */
Outlet.belongsTo(CityList, {
    foreignKey: 'city_id'
});
CityList.hasMany(Outlet, {
    foreignKey: 'city_id'
});

/** User Join */
Outlet.belongsTo(User, {
    foreignKey: 'user_id'
});
User.hasMany(Outlet, {
    foreignKey: 'user_id'
});




/** Categories Join */
// Outlet.belongsTo(Category, {foreignKey: 'category_id'});
// Category.hasMany(Outlet, {foreignKey: 'category_id'});

module.exports = Outlet;