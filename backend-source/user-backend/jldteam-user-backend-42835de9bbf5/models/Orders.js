const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const UserAddress = require('./UserAddress');
const User = require('./User');
const Outlet = require('./Outlet');
const TransactionFiat = require('./TransactionFiat');
const TransactionCrypto = require('./TransactionCrypto');
const CollectedCoupon = require('./CollectedCoupon');


const tableName = 'orders';

class Orders extends Sequelize.Model {}

Orders.init({

    orderId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id',
    },

    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'user_id',
    },

    outletId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'outlet_id',
    },

    orderTotal: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        field: 'total'
    },
    orderSubTotal: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        field: 'sub_total'
    },

    vat: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'vat'
    },

    couponCode: {
        type: Sequelize.STRING(30),
        allowNull: true,
        field: 'coupon_code'
    },

    couponDiscount: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'coupon_discount'
    },

    //need to do this properly. TAK
    collectedCouponId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'collected_coupon_id'
    },

    paymentStatus: {
        type: Sequelize.ENUM('PENDING', 'COMPLETE'),
        allowNull: false,
        field: 'payment_status'
    },

    paymentType: {
        type: Sequelize.ENUM('COD', 'CASH', 'CRYPTO_WALLET', 'FIAT_WALLET'),
        allowNull: false,
        field: 'payment_type'
    },

    orderType: {
        type: Sequelize.ENUM('DINE_IN', 'DELIVERY'),
        allowNull: false,
        field: 'order_type'
    },

    orderStatus: {
        type: Sequelize.ENUM('PENDING', 'CANCELLED_BY_USER', 'CANCELLED_BY_MERCHANT', 'DELIVERED', 'PREPARING', 'ON_THE_WAY', 'ACCEPTED'),
        allowNull: false,
        field: 'status'
    },

    orderStateChangeTime: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'order_state_time_change'
    },

    orderCancelCharges: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        field: 'cancel_charges'
    },

    addressId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'user_address_id'
    },

    itmQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'item_quantity'
    },

    instructions: {
        type: Sequelize.STRING(300),
        allowNull: true,
        field: 'instructions'
    },

    tableNumber: {
        type: Sequelize.STRING(10),
        allowNull: true,
        field: 'table_number'
    },

    cancelReason: {
        type: Sequelize.STRING(300),
        allowNull: true,
        field: 'cancel_reason'
    },

    waitingTimeInMinutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'waiting_time'
    },

    isOrderDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'soft_delete'
    },
}, {
    sequelize,
    tableName
});

Orders.belongsTo(UserAddress, {
    foreignKey: 'user_address_id',
});

Orders.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

Orders.belongsTo(Outlet, {
    foreignKey: {
        name: 'outletId',
        allowNull: false,
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

Orders.belongsTo(TransactionFiat, {
    foreignKey: {
        name: 'fiatTxnId',
        allowNull: true,
        field: 'fiat_txn_id',
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

Orders.belongsTo(TransactionCrypto, {
    foreignKey: {
        name: 'cryptoTxnId',
        allowNull: true,
        field: 'crypto_txn_id',
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

Orders.belongsTo(CollectedCoupon, {
    foreignKey: {
        name: 'collectedCouponId',
        allowNull: true,
        field: 'collected_coupon_id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'NO ACTION'
});


module.exports = Orders;