const Sequelize = require('sequelize');
const sequelize = require('../config/database');


const tableName = 'coupon_category';


    class CouponCategory extends Sequelize.Model { };

    CouponCategory.init({
    category_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        validate: {
            len: [1, 50]
        }
    },
    description: {
        type: Sequelize.STRING(100),
        allowNull: true,
        validate: {
            len: [0, 100]
        }
    }
}, {
    sequelize,
    tableName
});

// CouponCategory.hasMany(CouponCategory, {
//     foreignKey: 'parrent_cat_id',
//     as: 'Children',
//     allowNull:true
// });

module.exports = CouponCategory;