const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Brand = require('./Brand');
const Outlet = require('./Outlet');


const tableName = 'categories';



class Categories extends Sequelize.Model {};

Categories.init({
    title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
            len: [1, 50]
        }
    },
    title_en: {
        type: Sequelize.STRING(),
        allowNull: true
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