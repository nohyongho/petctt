const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Brand = require('./Brand');
const Currency = require('./Currency');
const Category = require('./Categories');

const Outlet = require('./Outlet');


const tableName = 'coupon';

const Coupon = sequelize.define('Coupon', {
    outlet_id: {
        type: Sequelize.INTEGER,
    },
    brand_id: {
        type: Sequelize.INTEGER,
    },
    coupon_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
            len: [1, 100]
        },
    },
    coupon_type: {
        type: Sequelize.ENUM('common', 'random', 'user_localtion'),
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
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0
    },
    percent_off: {
        type: Sequelize.INTEGER(11)
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
    coupon_image: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    per_user: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    status: {
        type: Sequelize.ENUM('available', 'pending', 'expired')
    },
    is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    max_discount: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
    },
    is_countrywide: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true,
    },
}, {
    tableName
});

Coupon.belongsTo(Brand, {
    foreignKey: 'brand_id'
});
Brand.hasMany(Coupon, {
    foreignKey: 'brand_id'
});

Coupon.belongsTo(Currency, {
    foreignKey: 'currency_id'
});
Currency.hasMany(Coupon, {
    foreignKey: 'currency_id'
});

Coupon.belongsTo(Category, {
    foreignKey: 'category_id'
});
Category.hasMany(Coupon, {
    foreignKey: 'category_id'
});

Coupon.belongsTo(Outlet, {
    foreignKey: 'outlet_id'
});

Outlet.hasMany(Coupon, {
    foreignKey: 'outlet_id'
});

Outlet.hasMany(Coupon, {
    foreignKey: 'outlet_id',
    as: 'CouponCountryWide',
});


module.exports = Coupon;