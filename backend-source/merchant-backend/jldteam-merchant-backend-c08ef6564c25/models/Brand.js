const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Category = require('./Categories');
const User = require('./User');
const Outlet = require('./Outlet');
const CountryList = require('./CountryList');


const tableName = 'brand';

class Brand extends Sequelize.Model { };

 Brand.init({
    brand_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
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
        unique: true,
        validate: {
            len: [8, 15]
        },
    },
    //  contact_no:{
    //     type:Sequelize.STRING,
    //     unique:true
    // },
    country_id: {
        type: Sequelize.INTEGER,
    },
    category_id: {
        type: Sequelize.INTEGER,
    },
    
    country_code:{
        type:Sequelize.STRING,
       
    },
    
    postal_code:{
        type:Sequelize.STRING,
       
    },
    address:{
        type:Sequelize.STRING,
      
    },

}, {
    sequelize,
    tableName
});

/** Category Join */
Brand.belongsTo(Category, { foreignKey: 'category_id' });

/** Category Join */
Brand.belongsTo(CountryList, { foreignKey: 'country_id' });

/** MpBrandCategory Join */
Brand.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Brand, { foreignKey: 'user_id' });

  Brand.hasMany(Outlet, { foreignKey: 'brand_id' });
  Outlet.belongsTo(Brand, { foreignKey: 'brand_id' });

module.exports = Brand;