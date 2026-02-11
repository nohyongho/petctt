const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Brand = require('./Brand');
const Categories = require('./Categories');


const tableName = 'mp_brand_category';

const MpBrandCategory = sequelize.define('MpBrandCategory', {}, {
    tableName
});

/** Brand Join */
MpBrandCategory.belongsTo(Brand, {
    foreignKey: 'brand_id'
});
Brand.hasMany(MpBrandCategory, {
    foreignKey: 'brand_id'
});

/** Categories Join */
MpBrandCategory.belongsTo(Categories, {
    foreignKey: 'category_id'
});
Categories.hasMany(MpBrandCategory, {
    foreignKey: 'category_id'
});

module.exports = MpBrandCategory;