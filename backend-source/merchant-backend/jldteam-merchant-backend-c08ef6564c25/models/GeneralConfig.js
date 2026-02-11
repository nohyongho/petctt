const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Categories');
const User = require('./User');
const Outlet = require('./Outlet');
const CountryList = require('./CountryList');
const tableName = 'general_config';

class GeneralConfig extends Sequelize.Model {};

GeneralConfig.init({

    config_name: {
        type: Sequelize.INTEGER,
    },
    config_value: {
        type: Sequelize.INTEGER,
    },
    comments: {
        type: Sequelize.INTEGER,
    },

}, {
    sequelize,
    tableName
});

// /** Category Join */
// Brand.belongsTo(Category, { foreignKey: 'category_id' });

// /** Category Join */
// Brand.belongsTo(CountryList, { foreignKey: 'country_id' });

// /** MpBrandCategory Join */
// Brand.belongsTo(User, { foreignKey: 'user_id' });
// User.hasMany(Brand, { foreignKey: 'user_id' });

// Brand.hasMany(Outlet, { foreignKey: 'brand_id' });
// Outlet.belongsTo(Brand, { foreignKey: 'brand_id' });

module.exports = GeneralConfig