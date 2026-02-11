const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const CouponCategory = require('../models/CouponCategory');
const Category = require('./Categories');
const User = require('./User');
const Brand = require('./Brand');
const Outlet = require('./Outlet');


const tableName = 'products';

const Products = sequelize.define('products', {
    product_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [1, 50]
        },
    },
    product_desc: {
        type: Sequelize.STRING,
    },

    category_id: {
        type: Sequelize.INTEGER,
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
    price: {
        type: Sequelize.STRING,

    },
    is_deleted: {
        type: Sequelize.BOOLEAN,
    },

}, {
    tableName
});


/** Subcategories Join */
Products.belongsTo(Category, { foreignKey: 'category_id' });
Category.hasMany(Products, { foreignKey: 'category_id' });
/** brand Join */
Products.belongsTo(Brand, { foreignKey: 'brand_id' });
Brand.hasMany(Products, { foreignKey: 'brand_id' });
/** Outlet Join */
Products.belongsTo(Outlet, { foreignKey: 'outlet_id' });
Outlet.hasMany(Products, { foreignKey: 'outlet_id' });
/** MpBrandCategory Join */
Products.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Products, { foreignKey: 'user_id' });
module.exports = Products;