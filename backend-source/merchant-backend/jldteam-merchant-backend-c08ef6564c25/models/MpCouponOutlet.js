const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Coupon = require('./Coupon');
const Outlet = require('./Outlet');


const tableName = 'mp_coupon_outlet';

const MpCouponOutlet = sequelize.define('MpCouponOutlet', {}, {
    tableName
});

/** Coupon Join */
MpCouponOutlet.belongsTo(Coupon, {
    foreignKey: 'coupon_id'
});
Coupon.hasMany(MpCouponOutlet, {
    foreignKey: 'coupon_id'
});

/** Outlet Join */
MpCouponOutlet.belongsTo(Outlet, {
    foreignKey: 'outlet_id'
});
Outlet.hasMany(MpCouponOutlet, {
    foreignKey: 'outlet_id'
});

module.exports = MpCouponOutlet;