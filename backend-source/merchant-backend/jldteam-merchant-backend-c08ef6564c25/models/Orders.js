const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const CouponCategory = require('./CouponCategory');
const Category = require('./Categories');
const User = require('./User');
const Brand = require('./Brand');
const Outlet = require('./Outlet');
const UserAddress = require('./UserAddress');


const tableName = 'orders';

const Orders = sequelize.define('orders', {
 

    user_id: {
        type: Sequelize.INTEGER,
    },
    outlet_id: {
        type: Sequelize.INTEGER,
    },

    total: {
        type: Sequelize.DECIMAL,
    },
    sub_total: {
        type: Sequelize.DECIMAL,
    },
    vat: {
        type: Sequelize.DECIMAL,
    },

    coupon_code: {
        type: Sequelize.STRING,
    },
    
    coupon_discount: {
        type: Sequelize.DECIMAL,
    },
    payment_status: {
        type: Sequelize.STRING,
    },
    
    payment_type: {
        type: Sequelize.STRING,
    },
    order_type: {
        type: Sequelize.STRING,
    },
    status: {
        type: Sequelize.STRING,
    },
    
    user_address_id: {
        type: Sequelize.INTEGER,
    },
    item_quantity: {
        type: Sequelize.INTEGER,
    },
    instructions: {
        type: Sequelize.STRING,
    },

    table_number:{
        type: Sequelize.STRING,
    }
    ,
    cancel_reason: {
        type: Sequelize.STRING,
    },
    waiting_time: {
        type: Sequelize.INTEGER,
    },
    soft_delete: {
        type: Sequelize.INTEGER,
    },
    
    



}, {
    tableName
});



module.exports = Orders;


/** User Join */
Orders.belongsTo(Outlet, { foreignKey: 'outlet_id' });
Outlet.hasMany(Orders, { foreignKey: 'outlet_id' });



/** user address join */
Orders.belongsTo(UserAddress, { foreignKey: 'user_address_id' });
UserAddress.hasMany(Orders, { foreignKey: 'user_address_id' });