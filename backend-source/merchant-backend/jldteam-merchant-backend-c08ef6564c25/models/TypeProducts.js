const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Brand = require('./Brand');
// const Currency = require('./Currency');
const Category = require('./Categories');
// const MpBrandCategory = require('./MpBrandCategory');
const Outlet = require('./Outlet');
const Products = require('../models/Products');
const tableName = 'type_products';



class TypeProducts extends Sequelize.Model { };

TypeProducts.init({
    type_title: {
        type: Sequelize.STRING(100),
       
    },
    



}, {
    sequelize,
    tableName
});






module.exports = TypeProducts;