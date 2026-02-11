const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Products = require('./Products');
const ProductTypes = require('./ProductTypes');

const tableName = 'mp_type_products';

class ProductTypesMP extends Sequelize.Model {}

ProductTypesMP.init({

    productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'product_id',
        unique: 'tak_unique',
    },

    productTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'type_product_id',
        unique: 'tak_unique',
    },

}, {
    sequelize,
    tableName
});

ProductTypesMP.belongsTo(Products, {
    foreignKey: {
        name: 'productId',
        allowNull: false,
    },
});

Products.hasMany(ProductTypesMP, {
    foreignKey: {
        name: 'productId',
        allowNull: false,
    },
});

ProductTypesMP.belongsTo(ProductTypes, {
    foreignKey: {
        name: 'productTypeId',
        allowNull: false,
    },
});

module.exports = ProductTypesMP;