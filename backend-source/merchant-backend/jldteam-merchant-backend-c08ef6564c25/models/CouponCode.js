const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Coupon = require('./Coupon');

const tableName = 'coupon_code';

const CouponCode = sequelize.define('CouponCode', {
    coupon_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        validate: {
            len: [1, 20]
        },
    },
    is_used: {
        type: Sequelize.BOOLEAN
    }
}, {
        tableName
    }
);

/** Coupon Join */
CouponCode.belongsTo(Coupon, {
    foreignKey: 'coupon_id'
});
Coupon.hasMany(CouponCode, {
    foreignKey: 'coupon_id'
});


module.exports = CouponCode;