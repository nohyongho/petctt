const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Coins = require('./Coins');


const tableName = 'user_wallet_crypto';

class UserWalletCrypto extends Sequelize.Model {}

UserWalletCrypto.init({

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
    tableName
});

UserWalletCrypto.belongsTo(Coins, {
    foreignKey: {
        name: 'coinId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

UserWalletCrypto.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

User.hasMany(UserWalletCrypto, {
    foreignKey: {
        name: 'userId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'NO CASCADE'
});

module.exports = UserWalletCrypto;