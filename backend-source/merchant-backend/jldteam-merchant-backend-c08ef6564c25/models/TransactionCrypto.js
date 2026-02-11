const Sequelize = require('sequelize');
const bcryptSevice = require('../services/bcrypt.service');
const sequelize = require('../config/database');
const Role = require('./Role');
const Fcm = require('./Fcm');


const tableName = 'transaction_crypto';


class TransactionCrypto extends Sequelize.Model { };

TransactionCrypto.init({
    referrence_txn_id: {
        type: Sequelize.INTEGER,
    },
    coin_id: {
        type: Sequelize.INTEGER,
    },
    debit_wallet_id: {
        type: Sequelize.INTEGER,
    },
    credit_wallet_id: {
        type: Sequelize.INTEGER,
    },
    amount_crypto: {
        type: Sequelize.INTEGER,
    },
    blockchain_txn_id:{
        type: Sequelize.STRING,
    },
    blockchain_address:{
        type:Sequelize.STRING,
    },
     status: {
        type: Sequelize.INTEGER,
    },
    soft_delete: {
        type: Sequelize.INTEGER,
    },
    txn_initiater_user_id:{
        type:Sequelize.INTEGER,
    },
    comments:{
        type:Sequelize.STRING,
    },
 
}, {
    sequelize,
    tableName
});



/** User Join */
 //UserWalletFiat.belongsTo(User, {foreignKey: 'user_id'});



module.exports = TransactionCrypto;