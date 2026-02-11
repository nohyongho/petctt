const Sequelize = require('sequelize');
const sequelize = require('../config/database');



const tableName = 'fcm';
class Fcm extends Sequelize.Model {}
Fcm.init({
  fcm_token: {
    type: Sequelize.STRING,
  },
  platform: {
    type: Sequelize.ENUM("android", "ios"),
    allowNull: false,
  },
  user_id: {
    type: Sequelize.INTEGER,
  }

}, {
  sequelize,
  tableName
});


module.exports = Fcm;