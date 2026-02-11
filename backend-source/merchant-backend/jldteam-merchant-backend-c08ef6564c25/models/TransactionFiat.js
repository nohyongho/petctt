const Sequelize = require('sequelize');
const bcryptSevice = require('../services/bcrypt.service');
const sequelize = require('../config/database');

const Role = require('./Role');
const Fcm = require('./Fcm');


const tableName = 'transaction_fiat';

class TransactionFiat extends Sequelize.Model { };


						


TransactionFiat.init({

    referrence_txn_id: {
        type: Sequelize.INTEGER,
    },
    debit_wallet_id: {
        type: Sequelize.DECIMAL,
    },
    credit_wallet_id: {
        type: Sequelize.INTEGER,
    },
    amount_krw: {
        type: Sequelize.INTEGER,
    },

    fee_krw: {
        type: Sequelize.DECIMAL,
    },
    status: {
        type: Sequelize.INTEGER,
    },
    txn_type: {
        type: Sequelize.INTEGER,
    },
    comments: {
        type: Sequelize.INTEGER,
    },
    txn_initiater_user_id: {
        type: Sequelize.INTEGER,
    },

   

}, {
    sequelize,
    tableName
});



/** User Join */
 //UserWalletFiat.belongsTo(User, {foreignKey: 'user_id'});



module.exports = TransactionFiat;