const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Coins = require('./Coins');

const tableName = 'crypto_addresses';

class CryptoAddresses extends Sequelize.Model {}

CryptoAddresses.init({

    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id',
    },

    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'user_id',
    },

    coinId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'coin_id',
    },

    address: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        field: 'address'
    },


}, {
    sequelize,
    tableName,
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
});

CryptoAddresses.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

User.hasMany(CryptoAddresses, {
    foreignKey: {
        name: 'userId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

CryptoAddresses.belongsTo(Coins, {
    foreignKey: {
        name: 'coinId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

module.exports = CryptoAddresses;