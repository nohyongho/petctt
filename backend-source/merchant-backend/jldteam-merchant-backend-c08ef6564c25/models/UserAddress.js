const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const CountryList = require('./CountryList');
const StateList = require('./StateList');
const CityList = require('./CityList');
const Outlet = require('./Outlet');
const Orders = require('./Orders');
const Products = require('../models/Products');

const tableName = 'user_address';

const UserAddress = sequelize.define('UserAddress', {
  
  
    city_name: {
        type: Sequelize.STRING(),
        
    },
    land_line_number: {
        type: Sequelize.STRING(),
        
    },
    mobile_number: {
        type: Sequelize.STRING(),
        
    },
    type: {
        type: Sequelize.STRING(),
        
    },
    full_address: {
        type: Sequelize.STRING(),
        
    },

	
    // id 
    // user_id
    // country_id
    // state_id
    // city_id
    // city_name
    // land_line_number
    // mobile_number
    // type
    // full_address
    // flat_number
    // floor
    // building_name
    // landmark
    // postal_code
    // is_default
























}, {
    tableName
});


module.exports = UserAddress;


