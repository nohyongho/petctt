const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Brand = require('./Brand');
const Outlet = require('./Outlet');


const tableName = 'categories';

class Categories extends Sequelize.Model {}


Categories.init({
    title: {
        type: Sequelize.STRING(64),
        allowNull: false,
    },
    title_en: {
        type: Sequelize.STRING(64),
        allowNull: true,
        defaultValue: null
    },
    image: {
        type: Sequelize.STRING(),
        allowNull: true
    }
}, {
    sequelize,
    tableName
});

Categories.hasMany(Categories, {
    foreignKey: 'parent_id',
    as: 'Children',
    allowNull: true
});

module.exports = Categories;