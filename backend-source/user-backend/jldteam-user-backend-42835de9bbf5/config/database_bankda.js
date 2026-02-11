const Sequelize = require('sequelize');
const connection = require('./connection');

let databaseBankDa;

switch (process.env.NODE_ENV) {

  default:
    databaseBankDa = new Sequelize(
      connection.bank_da.database,
      connection.bank_da.username,
      connection.bank_da.password, {
        logging: console.log,
        host: connection.bank_da.host,
        dialect: connection.bank_da.dialect,
        pool: {
          max: 5,
          min: 0,
          idle: 10000,
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
        //for writing to database
      });
}

module.exports = databaseBankDa;