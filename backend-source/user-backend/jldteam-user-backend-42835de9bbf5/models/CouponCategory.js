const Sequelize = require('sequelize');
const sequelize = require('../config/database');


const tableName = 'categories';

const Categories = sequelize.define('Categories', {
    title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
            len: [1, 50]
        }
    },
    image: {
        type: Sequelize.STRING(),
        allowNull: true
    }
}, {
    tableName
});

module.exports = Categories;