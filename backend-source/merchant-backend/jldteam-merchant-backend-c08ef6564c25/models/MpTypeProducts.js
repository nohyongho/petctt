const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Brand = require('./Brand');
// const Currency = require('./Currency');
const Category = require('./Categories');
// const MpBrandCategory = require('./MpBrandCategory');
const Outlet = require('./Outlet');
const Products = require('../models/Products');
const TypeProducts = require('../models/TypeProducts');


const tableName = 'mp_type_products';



class MpTypeProducts extends Sequelize.Model { };

MpTypeProducts.init({
    product_id: {
        type: Sequelize.INTEGER(),
       
    },
    
    type_product_id: {
        type: Sequelize.INTEGER(),
       
    },


}, {
    sequelize,
    tableName
});


/** Type Products join  */
MpTypeProducts.belongsTo(TypeProducts, {
    foreignKey: 'type_product_id'
});


/**  Products join  */
MpTypeProducts.belongsTo(Products, {
    foreignKey: 'product_id'
});
Products.hasMany(MpTypeProducts, { foreignKey: 'product_id' });



module.exports = MpTypeProducts;