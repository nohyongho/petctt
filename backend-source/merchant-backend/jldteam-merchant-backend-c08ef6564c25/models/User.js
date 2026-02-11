const Sequelize = require('sequelize');
const bcryptSevice = require('../services/bcrypt.service');
const sequelize = require('../config/database');

const Role = require('./Role');
const Fcm = require('./Fcm');
UserWalletFiat =require('./UserWalletFiat')
UserWalletCrypto =require('./UserWalletCrypto')


const tableName = 'user';



    class User extends Sequelize.Model { };

    User.init({
    email: {
        type: Sequelize.STRING,
        unique: true,
    },
    // contact_no:{
    //     type:Sequelize.STRING,
    //     unique:true
    // },
    password: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('password', bcryptSevice.password(val));
        }
    },
    full_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
        validate: {
            len: [3, 50]
        },
    },
    age: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
            min: 1,
            max: 120
        }
    },
    gender: {
        type: Sequelize.STRING(12),
        allowNull: true,
        defaultValue: null
    },
    is_email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    user_status: {
        type: Sequelize.ENUM('active', 'blocked'),
        allowNull: false,
        defaultValue: 'blocked'
    },
    isDeleted: {
        type:Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue:false
    },
    user_status_changed_at: {
        type: Sequelize.DATE,
    },
    login_status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    login_time: {
        type: Sequelize.DATE,
    },


    merchant_email: {
        type: Sequelize.STRING,
      
    },
  
    merchant_password: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('merchant_password', bcryptSevice.password(val));
        }
    },
   

}, {
    sequelize,
    tableName
});

/** Role Join */
User.belongsTo(Role, {
    foreignKey: 'role_id'
});
Role.hasMany(User, {
    foreignKey: 'role_id'
});

User.hasMany(Fcm,{
    foreignKey: 'user_id'
});
Fcm.belongsTo(User,{
    foreignKey: 'user_id'
});


User.hasMany(UserWalletFiat, {
    foreignKey: 'user_id'
});
UserWalletFiat.belongsTo(User, {foreignKey: 'user_id'});

User.hasMany(UserWalletCrypto, {
    foreignKey: 'user_id'
});
UserWalletCrypto.belongsTo(User, {
    foreignKey: 'user_id'
});





module.exports = User;