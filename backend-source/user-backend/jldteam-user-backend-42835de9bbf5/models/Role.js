const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const tableName = 'role';

const Role = sequelize.define('Role', {
    name: {
        type: Sequelize.ENUM('admin', 'user', 'merchant','outletUser'),
        allowNull: false,
    }

}, {
    tableName
});

module.exports = Role;