const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Outlet = require('./Outlet');


const tableName = 'mp_user_outlet';

const MpUserOutlet = sequelize.define('MpUserOutlet', {}, {
    tableName
});

/** Coupon Join */
MpUserOutlet.belongsTo(User, {
    foreignKey: 'user_id'
});
User.hasMany(MpUserOutlet, {
    foreignKey: 'user_id'
});

/** Outlet Join */
MpUserOutlet.belongsTo(Outlet, {
    foreignKey: 'outlet_id'
});
Outlet.hasMany(MpUserOutlet, {
    foreignKey: 'outlet_id'
});

module.exports = MpUserOutlet;