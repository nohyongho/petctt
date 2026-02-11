const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const UserSeenAds = require('./ARM_UserSeenAds');

const tableName = 'arm_seen_ads_location';

class SeenAdsLocation extends Sequelize.Model {}

SeenAdsLocation.init({

    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id',
    },

    userSeenAdsId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'user_seen_ads_id',
    },

    lat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
        field: 'lat',
    },

    lng: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
        field: 'lng',
    },

    countryIso: {
        type: Sequelize.STRING(5),
        allowNull: true,
        field: 'country_iso',
    },

}, {
    sequelize,
    tableName,
    comment: "arm is prefixed to keep all advertisements, rewards and markers and its related tables together. TAK",
});

SeenAdsLocation.belongsTo(UserSeenAds, {
    foreignKey: {
        name: 'userSeenAdsId',
        allowNull: false,
    },
});

UserSeenAds.hasMany(SeenAdsLocation, {
    foreignKey: {
        name: 'userSeenAdsId',
        allowNull: false,
    },
});

module.exports = SeenAdsLocation;