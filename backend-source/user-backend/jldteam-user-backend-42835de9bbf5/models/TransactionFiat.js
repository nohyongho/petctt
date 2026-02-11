const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const UserWalletFiat = require('./UserWalletFiat');
const User = require('./User');
const TransactionCryptoReward = require('./ARM_RewardTxnCrypto');
const modelConstants = require('../constants/ModelConstants').modelConstants;


const TBLBANK = require('./TBLBANK');

const tableName = 'transaction_fiat';

class TransactionFiat extends Sequelize.Model {}

TransactionFiat.init({

    fiatTxnId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id',
    },

    refFiatTxnId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'referrence_txn_id',
        comment: 'ref id of same table. TAK'
    },

    txnInitiater: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'txn_initiater_user_id',
        comment: 'this is user id of the user who started this txn. TAK'
    },

    debitWallet: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'debit_wallet_id',
    },

    creditWallet: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'credit_wallet_id',
    },

    amount: {
        type: Sequelize.DECIMAL(13, 2),
        allowNull: false,
        field: 'amount_krw'
    },

    fee: {
        type: Sequelize.DECIMAL(13, 2),
        allowNull: true,
        field: 'fee_krw'
    },

    status: {
        type: Sequelize.ENUM(modelConstants.TXN_STATUS_ARRAY),
        allowNull: false,
        defaultValue: 'PENDING',
        field: 'status'
    },

    txnType: {
        type: Sequelize.ENUM(modelConstants.TXN_TYPES_ARRAY),
        allowNull: false,
        field: 'txn_type'
    },

    comments: {
        type: Sequelize.STRING(200),
        allowNull: true,
        field: 'comments'
    },

    bankdaRefId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'bankda_ref_id',
    },

    refRewardCryptoTxnId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'reward_crypto_txn_id',
        comment: 'ref id of crypto txn table while converting crypto to krw. only valid for reward wallet converstion to krw. TAK'
    },

    softDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'soft_delete'
    },

    Bkid: {
        type: Sequelize.INTEGER(10),
        allowNull: true,
        field: 'Bkid',
        comment: 'this is refernce txn id given by bank transaction by bankda client. TAK'
    },

}, {
    sequelize,
    tableName,
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
});


TransactionFiat.hasMany(TransactionFiat, {
    foreignKey: {
        name: 'refFiatTxnId',
        allowNull: true,
    },
    as: 'RefTransactionFiat',
});

TransactionFiat.belongsTo(UserWalletFiat, {
    foreignKey: {
        name: 'debitWallet',
        allowNull: false,
    },
    as: 'DebitWalletFiat',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

UserWalletFiat.hasMany(TransactionFiat, {
    foreignKey: {
        name: 'debitWallet',
        allowNull: false,
    },
    as: 'DebitTxnsFiat',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

TransactionFiat.belongsTo(UserWalletFiat, {
    foreignKey: {
        name: 'creditWallet',
        allowNull: false,
    },
    as: 'CreditWalletFiat',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

UserWalletFiat.hasMany(TransactionFiat, {
    foreignKey: {
        name: 'creditWallet',
        allowNull: false,
    },
    as: 'CreditTxnsFiat',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

TransactionFiat.belongsTo(TBLBANK, {
    foreignKey: {
        name: 'Bkid',
        allowNull: true,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION'
});

TransactionFiat.belongsTo(User, {
    foreignKey: {
        name: 'txnInitiater',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

TransactionFiat.belongsTo(TransactionCryptoReward, {
    foreignKey: {
        name: 'refRewardCryptoTxnId',
        allowNull: true,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

module.exports = TransactionFiat;