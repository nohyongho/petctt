const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Brand = require('./Brand');
// const Currency = require('./Currency');
const Category = require('./Categories');
// const MpBrandCategory = require('./MpBrandCategory');
const Outlet = require('./Outlet');

const tableName = 'coupon';



class Coupon extends Sequelize.Model {};

Coupon.init({
    coupon_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
            len: [1, 100]
        },
    },
    coupon_type: {
        type: Sequelize.ENUM('common', 'random'),
        allowNull: true,
    },
    total_coupons: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    remaining_coupons: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
    },
    percent_off: {
        type: Sequelize.INTEGER(11)
    },
    currency_id: {

        type: Sequelize.INTEGER()

    },
    valid_from: {
        type: Sequelize.DATE,
    },
    valid_till: {
        type: Sequelize.DATE,
    },
    description: {
        type: Sequelize.STRING(100),
        allowNull: true,
    },
    radius: {
        type: Sequelize.STRING(),

    },


    coupon_image: {
        type: Sequelize.STRING,
        allowNull: true,
    },

    // coupon_code: {
    //     type: Sequelize.STRING,

    // },
    per_user: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },

    brand_id: {
        type: Sequelize.INTEGER,
        allowNull: true,

    },
    outlet_id: {
        type: Sequelize.INTEGER,
        allowNull: true,

    },
    category_id: {
        type: Sequelize.INTEGER,


    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    is_deleted: {
        type: Sequelize.BOOLEAN,

    },

    max_discount: {
        type: Sequelize.DOUBLE,
    },
    type_position: {
        type: Sequelize.STRING,

    },
    design_position: {
        type: Sequelize.STRING,

    },
    location_position: {
        type: Sequelize.STRING,

    },
    is_countrywide: {
        type: Sequelize.BOOLEAN,

    },
    is_deleted: {
        type: Sequelize.BOOLEAN,

    },



}, {
    sequelize,
    tableName
});

/** MpBrandCategory Join */
Coupon.belongsTo(Brand, { foreignKey: 'brand_id' });
Brand.hasMany(Coupon, { foreignKey: 'brand_id' });

/** MpBrandCategory Join */
// Coupon.belongsTo(Currency, { foreignKey: 'currency_id' });
// Currency.hasMany(Coupon, { foreignKey: 'currency_id' });

/** Category Join */
Coupon.belongsTo(Category, { foreignKey: 'category_id' });
Category.hasMany(Coupon, { foreignKey: 'category_id' });

/** MpBrandCategory Join */
// Coupon.belongsTo(MpBrandCategory, { foreignKey: 'mpBrandCategory_id' });
// MpBrandCategory.hasMany(Coupon, { foreignKey: 'mpBrandCategory_id' });



/** outlet Join */
Coupon.belongsTo(Outlet, { foreignKey: 'outlet_id' });
Outlet.hasMany(Coupon, { foreignKey: 'outlet_id' });



module.exports = Coupon;