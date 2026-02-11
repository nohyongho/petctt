const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Coins = require('./Coins');
const RewardWalletCrypto = require('./ARM_RewardWalletCrypto');

const User = require('./User');

const modelConstants = require('../constants/ModelConstants').modelConstants;


const tableName = 'arm_reward_transaction_crypto';

class TransactionCryptoReward extends Sequelize.Model {}

TransactionCryptoReward.init({

    cryptoTxnId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id',
    },

    refCryptoTxnId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'referrence_txn_id',
        comment: 'ref id of same table. TAK'

    },

    blockChainTxnId: {
        type: Sequelize.STRING(64),
        allowNull: true,
        field: 'blockchain_txn_id',
    },

    blockChainAddress: {
        type: Sequelize.STRING(64),
        allowNull: false,
        field: 'blockchain_address',
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

    amountCrypto: {
        type: Sequelize.DECIMAL(17, 8),
        allowNull: false,
        field: 'amount_crypto'
    },

    feeCrypto: {
        type: Sequelize.DECIMAL(17, 8),
        allowNull: true,
        field: 'fee_crypto'
    },

    coinId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'coin_id',
        comment: "this here is not neccessory as it is redundant, using it to save long joins. TAK"
    },

    status: {
        type: Sequelize.ENUM(modelConstants.TXN_STATUS_ARRAY),
        allowNull: false,
        defaultValue: 'PENDING',
        field: 'status'
    },

    txnType: {
        type: Sequelize.ENUM(modelConstants.REWARD_TXN_TYPES_ARRAY),
        allowNull: false,
        field: 'txn_type'
    },

    comments: {
        type: Sequelize.STRING(200),
        allowNull: true,
        field: 'comments'
    },

    refRewardFiatTxnId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'reward_fiat_txn_id',
        comment: 'ref id of fiat txn table after converting crypto to krw. only valid for reward wallet converstion to krw. TAK'
    },

    softDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'soft_delete'
    },

}, {
    sequelize,
    tableName,
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
});


TransactionCryptoReward.hasMany(TransactionCryptoReward, {
    foreignKey: {
        name: 'refCryptoTxnId',
        allowNull: true,
    },
    as: 'RefRewardTransactionCrypto',
});

TransactionCryptoReward.belongsTo(RewardWalletCrypto, {
    foreignKey: {
        name: 'debitWallet',
        allowNull: false,
    },
    as: 'DebitWallet',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

RewardWalletCrypto.hasMany(TransactionCryptoReward, {
    foreignKey: {
        name: 'debitWallet',
        allowNull: false,
    },
    as: 'DebitTxnsCrypto',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

TransactionCryptoReward.belongsTo(RewardWalletCrypto, {
    foreignKey: {
        name: 'creditWallet',
        allowNull: false,
    },
    as: 'CreditWallet',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

RewardWalletCrypto.hasMany(TransactionCryptoReward, {
    foreignKey: {
        name: 'creditWallet',
        allowNull: false,
    },
    as: 'CreditTxnsCrypto',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});


TransactionCryptoReward.belongsTo(Coins, {
    foreignKey: {
        name: 'coinId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

TransactionCryptoReward.belongsTo(User, {
    foreignKey: {
        name: 'txnInitiater',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});


module.exports = TransactionCryptoReward;