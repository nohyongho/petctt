const Sequelize = require('sequelize');
const sequelize = require('../config/database');


const tableName = 'subcategories';

const SubCategories = sequelize.define('SubCategories', {
    title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
            len: [1, 50]
        }
    },
    image:{
        type: Sequelize.STRING(),
        allowNull: true
    }
    category_id:{
        type: Sequelize.INTEGER,
    }
}, {
    tableName
});

SubCategories.hasMany(Categories, {
    foreignKey: 'parent_id',
    as: 'Children',
    allowNull:true 
});

module.exports = Categories;