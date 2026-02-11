const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');

const tableName = 'user_wallet_fiat';

class UserWalletFiat extends Sequelize.Model {}

UserWalletFiat.init({

    walletIdFiat: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id',
    },

    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        field: 'user_id',
    },

    balanceKRW: {
        type: Sequelize.DECIMAL(13, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'balance_krw'
    },

    symbol: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'KRW',
        field: 'symbol'
    },

    sign: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '₩',
        field: 'sign'
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
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
});

UserWalletFiat.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

User.hasOne(UserWalletFiat, {
    foreignKey: {
        name: 'userId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});


module.exports = UserWalletFiat;