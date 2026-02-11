const Sequelize = require('sequelize');
const bcryptSevice = require('../services/bcrypt.service');
const sequelize = require('../config/database');

const Role = require('./Role');
const Fcm = require('./Fcm');


const tableName = 'user_wallet_fiat';

class UserWalletFiat extends Sequelize.Model { };

UserWalletFiat.init({
    user_id: {
        type: Sequelize.INTEGER,
    },
    balance_krw: {
        type: Sequelize.DECIMAL,
    },
    status: {
        type: Sequelize.INTEGER,
    },
    soft_delete: {
        type: Sequelize.INTEGER,
    },
    

    sign: {
        type: Sequelize.STRING,
    },
   

}, {
    sequelize,
    tableName
});



/** User Join */
 //UserWalletFiat.belongsTo(User, {foreignKey: 'user_id'});



module.exports = UserWalletFiat;