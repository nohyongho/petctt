const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Coins = require('./Coins');


const tableName = 'arm_reward_wallet_crypto';

class RewardWalletCrypto extends Sequelize.Model {}

RewardWalletCrypto.init({

    walletIdCrypto: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id',
    },

    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: 'tak_unique',
        field: 'user_id',
    },

    coinId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: 'tak_unique',
        field: 'coin_id',
    },

    balanceCrypto: {
        type: Sequelize.DECIMAL(17, 8),
        allowNull: false,
        defaultValue: 0,
        field: 'balance_crypto'
    },

    status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'status'
    },

    softDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'soft_delete'
    },

}, {
    sequelize,
    tableName,
    comment: "arm is prefixed to keep all advertisements, rewards and markers and its related tables together. TAK",
});

RewardWalletCrypto.belongsTo(Coins, {
    foreignKey: {
        name: 'coinId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

RewardWalletCrypto.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

User.hasMany(RewardWalletCrypto, {
    foreignKey: {
        name: 'userId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'NO CASCADE'
});

module.exports = RewardWalletCrypto;