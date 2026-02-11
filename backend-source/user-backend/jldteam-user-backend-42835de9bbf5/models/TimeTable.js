const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Outlet = require('./Outlet');


const tableName = 'time_table';

const TimeTable = sequelize.define('TimeTable', {
    opening: {
        type: Sequelize.TIME,
        allowNull: true,
    },
    closing: {
        type: Sequelize.TIME,
        allowNull: true,
    },
    day: {
        type: Sequelize.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') 
    }
}, {
    tableName
});

/** outlet Join */
TimeTable.belongsTo(Outlet, {
    foreignKey: 'outlet_id'
});
Outlet.hasMany(TimeTable, {
    foreignKey: 'outlet_id'
});


module.exports = TimeTable;