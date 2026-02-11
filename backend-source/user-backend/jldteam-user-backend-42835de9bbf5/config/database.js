const Sequelize = require('sequelize');
const connection = require('./connection');

let database;

switch (process.env.NODE_ENV) {
  case 'production':
    database = new Sequelize(
      connection.production.database,
      connection.production.username,
      connection.production.password, {
        logging: false,
        host: connection.production.host,
        dialect: connection.production.dialect,
        pool: {
          max: 15,
          min: 1,
          idle: 10000,
          acquire: 60000,
        },
        dialectOptions: {
          dateStrings: true,
          typeCast: function (field, next) { // for reading from database
            if (field.type === 'DATETIME') {
              return field.string()
            }
            return next()
          },
        },
        "timezone": "+09:00" //for writing to database
      });
    break;
  case 'testing':
    database = new Sequelize(
      connection.testing.database,
      connection.testing.username,
      connection.testing.password, {
        logging: console.log,
        host: connection.testing.host,
        dialect: connection.testing.dialect,
        pool: {
          max: 15,
          min: 1,
          idle: 10000,
          acquire: 60000,
        },
        dialectOptions: {
          dateStrings: true,
          typeCast: function (field, next) { // for reading from database
            if (field.type === 'DATETIME') {
              return field.string()
            }
            return next()
          },
        },
        "timezone": "+09:00" //for writing to database
      });
    break;
  case 'development':
    database = new Sequelize(
      connection.local.database,
      connection.local.username,
      connection.local.password, {
        logging: console.log,
        host: connection.local.host,
        dialect: connection.local.dialect,
        pool: {
          max: 15,
          min: 1,
          idle: 10000,
          acquire: 60000,
        },
        dialectOptions: {
          dateStrings: true,
          typeCast: function (field, next) { // for reading from database
            if (field.type === 'DATETIME') {
              return field.string()
            }
            return next()
          },
        },
        "timezone": "+09:00" //for writing to database
      });
    break;
  default:
    database = new Sequelize(
      connection.local.database,
      connection.local.username,
      connection.local.password, {
        logging: console.log,
        host: connection.local.host,
        dialect: connection.local.dialect,
        pool: {
          max: 30,
          min: 1,
          idle: 10000,
          acquire: 60000,
        },
        dialectOptions: {
          dateStrings: true,
          typeCast: function (field, next) { // for reading from database
            if (field.type === 'DATETIME') {
              return field.string()
            }
            return next()
          },
        },
        "timezone": "+09:00" //for writing to database
      });
}

module.exports = database;