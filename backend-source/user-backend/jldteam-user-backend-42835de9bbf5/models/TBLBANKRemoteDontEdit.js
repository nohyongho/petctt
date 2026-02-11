const Sequelize = require('sequelize');
const sequelize = require('../config/database_bankda');

const tableName = 'TBLBANK';

class TBLBANKRemoteDontEdit extends Sequelize.Model {}

TBLBANKRemoteDontEdit.init({
    Bkid: {
        type: Sequelize.INTEGER(10),
        autoIncrement: true,
        primaryKey: true,
    },

    Bkcode: {
        type: Sequelize.INTEGER(10),
        unique: true,
        defaultValue: null
    },

    Mid: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null,
    },
    Bkacctno: {
        type: Sequelize.STRING(64),
        allowNull: true,
        defaultValue: null,
    },
    Bkname: {
        type: Sequelize.STRING(32),
        allowNull: true,
        defaultValue: null
    },
    Bkdate: {
        type: Sequelize.STRING(8),
        allowNull: true,
        defaultValue: null
    },
    Bktime: {
        type: Sequelize.STRING(6),
        allowNull: true,
        defaultValue: null
    },
    Bkjukyo: {
        type: Sequelize.STRING(60),
        allowNull: true,
        defaultValue: null
    },
    Bkcontent: {
        type: Sequelize.STRING(60),
        allowNull: true,
        defaultValue: null
    },
    Bketc: {
        type: Sequelize.STRING(60),
        allowNull: true,
        defaultValue: null
    },
    Bkinput: {
        type: Sequelize.BIGINT(12),
        allowNull: true,
        defaultValue: 0
    },
    Bkoutput: {
        type: Sequelize.BIGINT(12),
        allowNull: true,
        defaultValue: 0
    },
    Bkjango: {
        type: Sequelize.BIGINT(12),
        allowNull: true,
        defaultValue: 0
    },
    Bkxferdatetime: {
        type: Sequelize.STRING(14),
        allowNull: true,
        defaultValue: null
    },
}, {
    sequelize,
    tableName,
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    indexes: [{
            unique: false,
            name: 'Bkacctno',
            fields: ['Bkacctno']
        }, {
            unique: false,
            name: 'Bkdate',
            fields: ['Bkdate']
        },
        {
            unique: false,
            name: 'Bkjukyo',
            fields: ['Bkjukyo']
        },
        {
            unique: false,
            name: 'Bkinput',
            fields: ['Bkinput']
        },
        {
            unique: false,
            name: 'Bkoutput',
            fields: ['Bkoutput']
        }
    ],
    timestamps: false,
});

module.exports = TBLBANKRemoteDontEdit;