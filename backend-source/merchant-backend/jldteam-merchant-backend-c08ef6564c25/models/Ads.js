const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Categories');
const User = require('./User');
const Outlet = require('./Outlet');
const CountryList = require('./CountryList');
const tableName = 'arm_ads';

class Ads extends Sequelize.Model {};

Ads.init({

    cat_id: {
        type: Sequelize.INTEGER,
    },
    crypto_txn_id: {
        type: Sequelize.INTEGER,
    },
    repeat_count: {
        type: Sequelize.INTEGER,
    },
    total_seen_count: {
        type: Sequelize.INTEGER,
    },
    advertiser_id: {
        type: Sequelize.INTEGER,
    },
    budget_itc: {
        type: Sequelize.INTEGER,
    },
    remaining_budget: {
        type: Sequelize.INTEGER,
    },
    per_view_price: {
        type: Sequelize.INTEGER,
    },
    title: {
        type: Sequelize.STRING(),
    },
    detail: {
        type: Sequelize.STRING(),
    },
    link: {
        type: Sequelize.STRING(),
    },
    img_url: {
        type: Sequelize.STRING(),
    },
    video_url: {
        type: Sequelize.STRING(),
    },
    ad_type: {
        type: Sequelize.STRING(255),
    },
    status: {
        type: Sequelize.STRING(255),

    },
    availbility: {
        type: Sequelize.STRING(15),
    },
    soft_delete: {
        type: Sequelize.INTEGER,
    },
    is_external_link: {
        type: Sequelize.INTEGER,
    },
    is_paused: {
        type: Sequelize.BOOLEAN,
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

module.exports = Ads;