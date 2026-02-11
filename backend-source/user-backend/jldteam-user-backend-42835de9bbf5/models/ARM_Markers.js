const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Categories = require('./Categories');
const TransactionCrypto = require('./TransactionCrypto');


const tableName = 'arm_markers';

class Markers extends Sequelize.Model {}

Markers.init({

    markerId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id',
    },

    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'user_id',
        comment: 'user id of the user who is making this marker. TAK'
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
        defaultValue: 100,
        field: 'repeat_count',
        comment: 'total number of times a user can see/click this marker in AR. TAK'
    },

    totalSeenCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_seen_count',
        comment: 'total number of times a all users saw this marker in AR. this can be verified by userseenads table too. TAK'
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

    markerImgUrl: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
        field: 'marker_img_url',
    },

    markerRefUrl: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
        field: 'marker_ref_url',
    },

    markerType: {
        type: Sequelize.ENUM('IMAGE', 'VIDEO'),
        allowNull: false,
        field: 'marker_type'
    },

    status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        defaultValue: 'ACTIVE',
        allowNull: false,
        field: 'status'
    },

    validFrom: {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.NOW,
        allowNull: false,
        field: 'valid_from'
    },

    validTill: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        field: 'valid_till'
    },

    isPrivate: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        field: 'is_private',
        comment: 'by default private, if kept public, any user will be able to scan the marker and see its output in AR. TAK'
    },

    availability: {
        type: Sequelize.ENUM('GLOBAL', 'COUNTRY', 'CITY'),
        defaultValue: 'GLOBAL',
        allowNull: false,
        field: 'availbility',
    },

}, {
    sequelize,
    tableName,
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    comment: "arm is prefixed to keep all advertisements, rewards and markers and its related tables together. TAK",
});

Markers.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

User.hasMany(Markers, {
    foreignKey: {
        name: 'userId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

Markers.belongsTo(Categories, {
    foreignKey: {
        name: 'catId',
        allowNull: true,
        defaultValue: null
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

Markers.belongsTo(TransactionCrypto, {
    foreignKey: {
        name: 'cryptoTxnId',
        field: 'crypto_txn_id',
        allowNull: true,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

module.exports = Markers;