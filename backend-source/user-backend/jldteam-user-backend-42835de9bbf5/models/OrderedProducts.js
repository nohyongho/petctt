const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Orders = require('./Orders');
const Products = require('./Products');

const tableName = 'ordered_products';

class OrderedProducts extends Sequelize.Model {}

OrderedProducts.init({
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id',
    },

    orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'order_id',
    },

    productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'product_id',
    },

    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'quantity'
    },

    unitPrice: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        field: 'unit_price'
    },

}, {
    sequelize,
    tableName
});

OrderedProducts.belongsTo(Orders, {
    foreignKey: 'order_id',
});

Orders.hasMany(OrderedProducts, {
    foreignKey: 'order_id',
});

OrderedProducts.belongsTo(Products, {
    foreignKey: 'product_id',
});

module.exports = OrderedProducts;