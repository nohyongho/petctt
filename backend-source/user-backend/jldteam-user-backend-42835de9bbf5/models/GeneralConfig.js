const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const tableName = 'general_config';

class GeneralConfig extends Sequelize.Model {}

GeneralConfig.init({

    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id',
    },

    configName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        field: 'config_name',
    },

    configValue: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: 'config_value',
    },

    comments: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
        field: 'comments',
    },

}, {
    sequelize,
    tableName
});

module.exports = GeneralConfig;