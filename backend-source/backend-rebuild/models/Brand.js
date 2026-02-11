const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Categories = require('../models/Categories');
const User = require('../models/User');


const tableName = 'brand';

const Brand = sequelize.define('Brand', {
    brand_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        validate: {
            len: [1, 50]
        },
    },
    image: {
        type: Sequelize.STRING(255)
    },
    phone_number: {
        type: Sequelize.STRING(15),
        allowNull: true,
        validate: {
            len: [8, 15]
        },
    },
    is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    }

}, {
    tableName
});
Brand.belongsTo(Categories, {
    foreignKey: 'category_id'
});
Categories.hasMany(Brand, {
    foreignKey: 'category_id'
});
/** User Join */
Brand.belongsTo(User, {
    foreignKey: 'user_id'
});
User.hasMany(Brand, {
    foreignKey: 'user_id'
});

module.exports = Brand;