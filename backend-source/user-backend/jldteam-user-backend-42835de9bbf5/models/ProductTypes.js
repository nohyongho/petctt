const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const tableName = 'type_products';

class ProductTypes extends Sequelize.Model {}


ProductTypes.init({
    title: {
        type: Sequelize.STRING(40),
        allowNull: false,
        field: 'type_title'
    },

    image: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
        field: 'image'
    },
}, {
    sequelize,
    tableName,
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
});

module.exports = ProductTypes;