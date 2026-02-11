const Sequelize = require('sequelize');
const bcryptSevice = require('../services/bcrypt.service');
const sequelize = require('../config/database');

const Role = require('./Role');
const Fcm = require('./Fcm');
const User = require('./User');
const Coin = require('./Coin');

const tableName = 'user_wallet_crypto';


 
class UserWalletCrypto extends Sequelize.Model { };


UserWalletCrypto.init({

    user_id: {
        type: Sequelize.INTEGER,
    },
    balance_crypto: {
        type: Sequelize.DECIMAL,
    },
    // balance_krw: {
    //     type: Sequelize.DECIMAL,
    // },
    status: {
        type: Sequelize.INTEGER,
    },
    soft_delete: {
        type: Sequelize.INTEGER,
    },


}, {
    sequelize,
    tableName
});




/** Coin Join */
UserWalletCrypto.belongsTo(Coin, {
    foreignKey: 'coin_id'
});


module.exports = UserWalletCrypto;


