const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');


const tableName = 'user_verification';

const UserVerification = sequelize.define('UserVerification', {
    verification_code: {
        type: Sequelize.STRING(64),
        unique: true,
    },
    verification_type: {
        type: Sequelize.ENUM('email', 'forgot password', 'reset password'),
    },
    status: {
        type: Sequelize.ENUM('active', 'used', 'expired'),
    }
}, {
    tableName
});

/** Country Join */
UserVerification.belongsTo(User, {
    foreignKey: 'user_id'
});
User.hasMany(UserVerification, {
    foreignKey: 'user_id'
});


module.exports = UserVerification;