const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const CouponCategory = require('../models/CouponCategory');
const Category = require('./Categories');
const User = require('./User');
const Brand = require('./Brand');
const Outlet = require('./Outlet');


const tableName = 'merchant_orders';

const MerchantOrders = sequelize.define('MerchantOrders', {
 
    
    coupon_id: {
        type: Sequelize.INTEGER,
    },
    user_id: {
        type: Sequelize.INTEGER,
    },
    transaction_fiat_id: {
        type: Sequelize.INTEGER,
    },
    transaction_crypto_id: {
        type: Sequelize.INTEGER,
    },
    amount:{
        type:Sequelize.STRING,
       
    },
    status: {
        type: Sequelize.BOOLEAN,
    },


}, {
    tableName
});


module.exports = MerchantOrders;


