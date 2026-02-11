const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Coupon = require('./Coupon');
const CouponCode = require('./CouponCode');
const Country = require('../models/CountryList');
const MpCouponOutlet = require('../models/MpCouponOutlet');


const tableName = 'collected_coupon';

const CollectedCoupon = sequelize.define('CollectedCoupon', {
    location: {
        type: Sequelize.GEOMETRY('POINT'),
    },
    hash: {
        type: Sequelize.STRING(64)
    },
    is_coupon: {
        type: Sequelize.ENUM('redeemed', 'expired', 'collected', 'pending')
    },
    is_deleted: {
        type: Sequelize.BOOLEAN,

    },
}, {
    tableName
});


/** User Join */
CollectedCoupon.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(CollectedCoupon, { foreignKey: 'user_id' });

/** Coupon Join */
CollectedCoupon.belongsTo(Coupon, { foreignKey: 'coupon_id' });
Coupon.hasMany(CollectedCoupon, { foreignKey: 'coupon_id' });

/** Coupon Code Join */
CollectedCoupon.belongsTo(CouponCode, { foreignKey: 'coupon_code_id' });
CouponCode.hasMany(CollectedCoupon, { foreignKey: 'coupon_code_id' });

/** Country Join */
CollectedCoupon.belongsTo(Country, { foreignKey: 'country_id' });
Country.hasMany(CollectedCoupon, { foreignKey: 'country_id' });

/** MpCouponOutlet Join */
CollectedCoupon.belongsTo(MpCouponOutlet, { foreignKey: 'MpCouponOutlet_id' });
MpCouponOutlet.hasMany(CollectedCoupon, { foreignKey: 'MpCouponOutlet_id' });


module.exports = CollectedCoupon;