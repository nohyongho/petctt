const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const tableName = 'role';

class Role extends Sequelize.Model { };

Role.init( {
    name: {
        type: Sequelize.ENUM('admin', 'user', 'merchant'),
        allowNull: false,
    }

}, {
    sequelize,
    tableName
});

module.exports = Role;