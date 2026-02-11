const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const CouponCategory = require('./CouponCategory');
const Category = require('./Categories');
const User = require('./User');
const Brand = require('./Brand');
const Outlet = require('./Outlet');
const Orders = require('./Orders');
const Products = require('../models/Products');


const tableName = 'ordered_products';

const Orderedproducts = sequelize.define('Orderedproducts', {
 

    order_id: {
        type: Sequelize.INTEGER,
    },
    product_id: {
        type: Sequelize.INTEGER,
    },

    quantity: {
        type: Sequelize.INTEGER,
    },
    unit_price: {
        type: Sequelize.DECIMAL,
    },
    

}, {
    tableName
});



module.exports = Orderedproducts;


/** orders */
Orderedproducts.belongsTo(Orders, { foreignKey: 'order_id' });
Orders.hasMany(Orderedproducts, { foreignKey: 'order_id' });


/** product */
Orderedproducts.belongsTo(Products, { foreignKey: 'product_id' });
Products.hasMany(Orderedproducts, { foreignKey: 'product_id' });