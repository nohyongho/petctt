const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Categories = require('../models/Categories');
const User = require('./User');
const Brand = require('./Brand');
const Outlet = require('./Outlet');


const tableName = 'products';

class Products extends Sequelize.Model {}

Products.init({
    product_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [1, 50]
        },
    },
    image: {
        type: Sequelize.STRING(255)
    },

    price: {
        type: Sequelize.DECIMAL
    },
    user_id: {
        type: Sequelize.INTEGER,
    },
    brand_id: {
        type: Sequelize.INTEGER,
    },
    outlet_id: {
        type: Sequelize.INTEGER,
    },
    image: {
        type: Sequelize.STRING,

    },
    product_desc: {
        type: Sequelize.STRING,
    },

    is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    }


}, {
    sequelize,
    tableName
});


/** Subcategories Join */
Products.belongsTo(Categories, {
    foreignKey: 'category_id'
});
Categories.hasMany(Products, {
    foreignKey: 'category_id'
});
/** brand Join */
Products.belongsTo(Brand, {
    foreignKey: 'brand_id'
});
Brand.hasMany(Products, {
    foreignKey: 'brand_id'
});
/** Outlet Join */
Products.belongsTo(Outlet, {
    foreignKey: 'outlet_id'
});
Outlet.hasMany(Products, {
    foreignKey: 'outlet_id'
});
Products.belongsTo(Outlet, {
    foreignKey: 'outlet_id'
});

module.exports = Products;