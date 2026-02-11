const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Categories = require('./Categories');
const TransactionCrypto = require('./TransactionCrypto');


const tableName = 'arm_ads';

class Ads extends Sequelize.Model {}

Ads.init({

    adId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id',
    },

    advertiserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'advertiser_id',
        comment: 'user id of the user who is making this ad. TAK'
    },

    catId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'cat_id',
    },

    cryptoTxnId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'crypto_txn_id',
        comment: 'this is txn id of the transaction paid to buy advertisement. TAK'
    },

    repeatCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'repeat_count',
        comment: 'total number of times a user can see/click this ad in AR. TAK'
    },

    totalSeenCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_seen_count',
        comment: 'total number of times a all users saw this ad in AR. this can be verified by userseenads table too. TAK'
    },

    budgetITC: {
        type: Sequelize.DECIMAL(17, 8),
        allowNull: false,
        defaultValue: 0,
        field: 'budget_itc',
        comment: 'total budget set for this ad in Intercash (ITC). TAK'
    },

    remainingBudget: {
        type: Sequelize.DECIMAL(17, 8),
        allowNull: false,
        field: 'remaining_budget',
        comment: 'after evey impression or click, deduct per impression amountand set here. TAK'
    },

    perViewPrice: {
        type: Sequelize.DECIMAL(17, 8),
        allowNull: false,
        defaultValue: 0.1,
        field: 'per_view_price',
        comment: 'on each view half of perViewPrice goes to viewer and half to Admin or CTT. TAK'
    },

    title: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: 'title',
    },

    detail: {
        type: Sequelize.STRING(200),
        allowNull: true,
        defaultValue: null,
        field: 'detail',
    },

    link: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
        field: 'link',
    },

    imgUrl: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
        field: 'img_url',
    },

    videoUrl: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
        field: 'video_url',
    },

    adType: {
        type: Sequelize.ENUM('IMAGE', 'VIDEO', 'LINK', 'QRAD'),
        allowNull: false,
        field: 'ad_type'
    },

    status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        field: 'status'
    },

    availability: {
        type: Sequelize.ENUM('GLOBAL', 'COUNTRY', 'CITY'),
        defaultValue: 'GLOBAL',
        allowNull: false,
        field: 'availbility',
    },

    isExternalLink: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
        field: 'is_external_link',
    },

    softDelete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
        field: 'soft_delete',
    },

    isPaused: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
        field: 'is_paused',
    },

}, {
    sequelize,
    tableName,
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    comment: "arm is prefixed to keep all advertisements, rewards and markers and its related tables together. TAK",
});

Ads.belongsTo(User, {
    foreignKey: {
        name: 'advertiserId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

User.hasMany(Ads, {
    foreignKey: {
        name: 'advertiserId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

Ads.belongsTo(Categories, {
    foreignKey: {
        name: 'catId',
        allowNull: true,
        defaultValue: null
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

Ads.belongsTo(TransactionCrypto, {
    foreignKey: {
        name: 'cryptoTxnId',
        field: 'crypto_txn_id',
        allowNull: true,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

module.exports = Ads;