const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Ads = require('./ARM_Ads');

const tableName = 'arm_user_seen_ads';

class UserSeenAds extends Sequelize.Model {}

UserSeenAds.init({

    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id',
    },

    adId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'ad_id',
        unique: 'tak_unique'
    },

    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'user_id',
        unique: 'tak_unique'
    },

    count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'count',
    },

}, {
    sequelize,
    tableName,
    comment: "arm is prefixed to keep all advertisements, rewards and markers and its related tables together. TAK",
});

UserSeenAds.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

User.hasMany(UserSeenAds, {
    foreignKey: {
        name: 'userId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

UserSeenAds.belongsTo(Ads, {
    foreignKey: {
        name: 'adId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

Ads.hasMany(UserSeenAds, {
    foreignKey: {
        name: 'adId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

module.exports = UserSeenAds;