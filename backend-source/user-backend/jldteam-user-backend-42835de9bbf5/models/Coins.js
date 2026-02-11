const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const tableName = 'coins';

class Coins extends Sequelize.Model {}

Coins.init({

    coinId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id',
    },

    coinName: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        field: 'name',
    },

    symbol: {
        type: Sequelize.STRING(15),
        allowNull: false,
        field: 'symbol',
    },

    imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'image_url'
    },

    webUrl: {
        type: Sequelize.STRING(80),
        allowNull: true,
        field: 'web_url',
        comment: 'website url of coin. TAK'
    },

    daemonApiUrl: {
        type: Sequelize.STRING(80),
        allowNull: true,
        field: 'daemon_api_url',
        comment: "this is backend api url for coin daemon to get coin related info like getbalance etc.. TAK"
    },

    rewardCnvrsnPrcnt: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 1,
        field: 'reward_convrsn_fee_prcnt'
    },

    krwToCryptoFeePrcnt: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 1,
        field: 'krw_to_crypto_fee_prcnt'
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
    krwPrice: {
        type: Sequelize.DECIMAL(13, 2),
        allowNull: false,
        field: 'krw_price'
    },

    minRewardConvert: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
        defaultValue: 1,
        field: 'min_reward_cnvrt'
    },

    minKrwToConvert: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
        defaultValue: 100,
        field: 'min_krw_to_cnvrt',
        comment : 'minimum krw to convert to crpto'
    },

}, {
    sequelize,
    tableName
});

module.exports = Coins;