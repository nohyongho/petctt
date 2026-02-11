/** Model */
const User = require('../models/User');
const Products = require('../models/Products');
const UserAddress = require('../models/UserAddress');

const Orders = require('../models/Orders');
const Outlet = require('../models/Outlet');
const Brand = require('../models/Brand');
const Role = require('../models/Role');
const UserWalletFiat = require('../models/UserWalletFiat');
const UserWalletCrypto = require('../models/UserWalletCrypto');
const Coins = require('../models/Coins');


const TransactionFiat = require('../models/TransactionFiat');
const TransactionCrypto = require('../models/TransactionCrypto');
const CollectedCoupon = require('../models/CollectedCoupon');
const Coupon = require('../models/Coupon');

const Fcm = require('../models/Fcm');

const OrderedProducts = require('../models/OrderedProducts');
/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');
const JOI = require('joi');
const sequelize = require('../config/database');
const Sequelize = require('sequelize');
const FirebaseMessaging = require('../helper/FirebaseMessaging');
const Utility = require('../helper/Utility');





const OrderController = () => {

    const createOrder = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                outletId: JOI.number().integer().min(1).strict().required(),
                orderTotal: JOI.number().strict().required(),
                orderSubTotal: JOI.number().strict().required(),
                vat: JOI.number().strict().required(),
                couponCode: JOI.string().max(30).allow('').optional(),
                couponDiscount: JOI.number().strict().optional(),
                collectedCouponId: JOI.number().integer().min(1).strict().optional(),
                couponId: JOI.number().integer().min(1).strict().optional(),
                paymentStatus: JOI.string().valid('PENDING', 'COMPLETE').required(),
                paymentType: JOI.string().valid('COD', 'CARD', 'CRYPTO', 'CASH', 'WALLET', 'CRYPTO_WALLET', 'FIAT_WALLET').required(),
                orderType: JOI.string().valid('DINE_IN', 'DELIVERY').optional(),
                orderStatus: JOI.string().valid('PENDING', 'CANCELLED_BY_USER', 'CANCELLED_BY_MERCHANT', 'DELIVERED', 'PREPARING', 'ON_THE_WAY').optional(),
                addressId: JOI.number().integer().min(1).strict().optional(),
                coinId: JOI.number().integer().min(1).strict().optional(),
                tableNumber: JOI.string().max(10).allow('').optional(),
                itmQuantity: JOI.number().integer().min(1).strict().required(),
                instructions: JOI.string().max(300).allow('').optional(),
                waitingTimeInMinutes: JOI.number().integer().strict().optional(),
                orderedProducts: JOI.array().items(JOI.object().keys({
                    productId: JOI.number().integer().strict().required(),
                    quantity: JOI.number().integer().strict().required(),
                    unitPrice: JOI.number().strict().required(),
                })),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            body.userId = user.data.user_id;

            var orderedProductsQty = body.orderedProducts.reduce((a, b) => {
                return a + b.quantity;
            }, 0);

            if (Number(body.itmQuantity) != orderedProductsQty) {
                return response.error(res, "Invalid order request, try again. Order qty EID000011");
            }

            var productsSubTotal = body.orderedProducts.reduce((a, b) => {
                return a + (b.unitPrice * b.quantity);
            }, 0);

            if (productsSubTotal - body.orderSubTotal != 0)
                return response.error(res, "Invalid order request, try again. Order subtotal EID000012");

            //verify order total check. TAK
            var tempOrderTotal = body.orderSubTotal - (body.couponDiscount || 0) + (body.vat || 0);
            if (tempOrderTotal != body.orderTotal)
                return response.error(res, "Invalid order request, try again. Order total EID000013");
            //end

            //end

            var txn = null;
            try {
                txn = await sequelize.transaction({
                    lock: Sequelize.Transaction.LOCK.UPDATE,
                    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
                });

                //checking user wallet balance if payment is crypto wallet or fiat wallet type. TAK
                var userObj = await User.findOne({
                    where: {
                        id: body.userId,
                        isDeleted: false,
                        user_status: 'active',
                    },
                    include: [{
                        required: true,
                        model: Role,
                        where: {
                            name: 'user'
                        }
                    }],
                    transaction: txn
                });

                if (!userObj) {
                    rollbackTxn(txn);
                    return response.error(res, "Order could not be created. User not active");
                }

                var orderObj = await Orders.create(body, {
                    transaction: txn
                });

                if (body.paymentType == "FIAT_WALLET") {
                    await userObj.reload({
                        include: {
                            attributes: {
                                exclude: ["createdAt", "updatedAt", "userId"]
                            },
                            model: UserWalletFiat,
                        },
                        transaction: txn
                    });

                    if (!userObj.UserWalletFiat) {
                        rollbackTxn(txn);
                        return response.error(res, "Order could not be created. User fiat wallet not found");
                    }

                    if (userObj.UserWalletFiat.balanceKRW < body.orderTotal) {
                        rollbackTxn(txn);
                        return response.error(res, "Order could not be created. Insufficient Balance");
                    }

                    var adminUserWithWallet = await Utility.getAdminFiatWallet(txn);
                    if (!adminUserWithWallet) {
                        rollbackTxn(txn);
                        return response.error(res, "Order could not be created. User or User wallet not found. AWNF00034");
                    }

                    var userWalletObj = userObj.UserWalletFiat;
                    console.log(orderObj.orderTotal + " new order amount deduction from user wallet fiat . order id " + orderObj.orderId + "  TAK");
                    await userWalletObj.decrement('balanceKRW', {
                        by: body.orderTotal,
                        transaction: txn
                    });

                    var adminWalletObj = adminUserWithWallet.UserWalletFiat;
                    console.log(orderObj.orderTotal + " admin wallet fiat credit for new order. order id " + orderObj.orderId + "  TAK");
                    await adminWalletObj.increment('balanceKRW', {
                        by: body.orderTotal,
                        transaction: txn
                    });

                    var txnObj = await TransactionFiat.create({
                        txnInitiater: userObj.id,
                        debitWallet: userWalletObj.walletIdFiat,
                        creditWallet: adminWalletObj.walletIdFiat,
                        amount: body.orderTotal,
                        status: "CONFIRMED",
                        txnType: "ORDER",
                        comments: "Paid for order"
                    }, {
                        transaction: txn
                    });

                    orderObj.paymentStatus = "COMPLETE";
                    orderObj.fiatTxnId = txnObj.fiatTxnId;

                    await orderObj.save({
                        transaction: txn
                    });

                    await userWalletObj.reload({
                        transaction: txn
                    });

                } else if (body.paymentType == "CRYPTO_WALLET") {
                    if (!body.coinId) {
                        rollbackTxn(txn);
                        return response.error(res, "Order could not be created. Coin id not provided");
                    }
                    await userObj.reload({
                        include: {
                            attributes: {
                                exclude: ["createdAt", "updatedAt", "userId"]
                            },
                            model: UserWalletCrypto,
                            include: {
                                model: Coins,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"]
                                },
                                where: {
                                    coinId: body.coinId
                                }

                            }
                        },
                        transaction: txn
                    });

                    if (!userObj.UserWalletCryptos || userObj.UserWalletCryptos.length == 0) {
                        rollbackTxn(txn);
                        return response.error(res, "Order could not be created. User crypto wallet not found");
                    }
                    //todo, handling user found crypto wallet to check sufficient balance to proceed order. right now only fiat is available in user end. TAK
                }
                //end

                //check if coupon applied. TAK
                if (body.collectedCouponId) {
                    var collectedCouponObj = await CollectedCoupon.findOne({
                        where: {
                            id: body.collectedCouponId,
                        },
                        transaction: txn,
                    })
                    if (!collectedCouponObj || !collectedCouponObj.is_coupon) {
                        rollbackTxn(txn);
                        return response.error(res, "Coupon Applied not found. Error CCNF000014");
                    }
                    if (collectedCouponObj.is_coupon.toUpperCase() != "COLLECTED") {
                        rollbackTxn(txn);
                        return response.error(res, "Coupon Applied is " + collectedCouponObj.is_coupon + ". Error CCNF000015");
                    }
                    if (collectedCouponObj.user_id != body.userId) {
                        rollbackTxn(txn);
                        return response.error(res, "Coupon Applied does not belongs to user. Error CCNF000016");
                    }
                    collectedCouponObj.is_coupon = "REDEEMED";
                    await collectedCouponObj.save({
                        transaction: txn,
                    })
                }
                //end

                var products = body.orderedProducts.map(product => {
                    product.orderId = orderObj.orderId;
                    return product;
                })

                await OrderedProducts.bulkCreate(products, {
                    transaction: txn
                });

                await txn.commit();

                sendCreateOrderNotification(orderObj);

                console.log("order created success. order id = " + orderObj.orderId + ". TAK");
                if (body.paymentType == "FIAT_WALLET")
                    response.success(res, "Order created successfully", {
                        orderId: orderObj.orderId,
                        userWalletFiat: userObj.UserWalletFiat
                    });
                response.successOther(res, "Order created successfully", orderObj.orderId)
            } catch (err) {
                console.log('Error::', err);
                if (txn) txn.rollback();
                return response.error(res, "Order could not be created. " + err.message);
            }

        } catch (error) {
            console.log('Error::', error);
            return response.error(res, error.message);
        }

    };

    const getOrderById = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                orderId: JOI.number().integer().required(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }
            let orderObj = await Orders.findOne({
                attributes: ["orderId", "orderTotal", "orderSubTotal", "vat", "couponCode",
                    "couponDiscount", "paymentStatus", "paymentType", "orderType", "orderStatus",
                    "orderStateChangeTime", "orderCancelCharges", "itmQuantity", "instructions", "cancelReason",
                    "waitingTimeInMinutes", "createdAt", "updatedAt", "fiatTxnId", "cryptoTxnId",
                    [Sequelize.fn("concat", Sequelize.fn("LPAD", Sequelize.col("Orders.id"), 8, 0), Sequelize.fn("DATE_FORMAT", Sequelize.col("Orders.createdAt"), "%d%m%Y")), "orderNumber"]
                ],
                where: {
                    userId: user.data.user_id,
                    orderId: body.orderId,
                    isOrderDeleted: false,
                },
                include: [{
                        model: Outlet,
                        attributes: {
                            include: [],
                            exclude: ["userId", ""]
                        },
                        include: {
                            model: User,
                            attributes: ['id', 'full_name', 'contact_no'],
                        }
                    },
                    {
                        model: UserAddress,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: OrderedProducts,
                        include: {
                            model: Products,
                            attributes: {
                                exclude: ["createdAt", "updatedAt"]
                            },
                        }
                    },
                    {
                        model: TransactionFiat
                    }, {
                        model: TransactionCrypto
                    },
                    {
                        model: CollectedCoupon,
                        attributes: ["is_coupon"],
                        include: {
                            model: Coupon,
                            attributes: ["coupon_name", "percent_off", "coupon_image", "max_discount"]
                        }
                    },
                ],

            });

            if (orderObj && orderObj.orderId)
                return response.success(res, constant.SUCCESS, orderObj);
            else
                return response.error(res, "Order not found");

        } catch (error) {
            console.log('Error::', error);
            return response.error(res, error.message);
        }

    };

    const getAllOrders = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {});

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            Orders.findAll({
                    attributes: ["orderId", "orderTotal", "orderSubTotal", "vat", "couponCode",
                        "couponDiscount", "paymentStatus", "paymentType", "orderType", "orderStatus",
                        "orderStateChangeTime", "orderCancelCharges", "itmQuantity", "instructions", "cancelReason",
                        "waitingTimeInMinutes", "createdAt", "updatedAt", "fiatTxnId", "cryptoTxnId",
                        [Sequelize.fn("concat", Sequelize.fn("LPAD", Sequelize.col("Orders.id"), 8, 0), Sequelize.fn("DATE_FORMAT", Sequelize.col("Orders.createdAt"), "%d%m%Y")), "orderNumber"]
                    ],
                    where: {
                        userId: user.data.user_id,
                        isOrderDeleted: false,
                    },
                    include: [{
                            model: Outlet,
                            attributes: {
                                exclude: ["createdAt", "updatedAt"]
                            },
                            include: [{
                                model: User,
                                attributes: ['id', 'full_name', 'contact_no'],
                            }, {
                                model: Brand,
                                attributes: {
                                    include: ["brand_name", "image"]
                                },
                            }]
                        },
                        {
                            model: UserAddress,
                            attributes: {
                                exclude: ["createdAt", "updatedAt"]
                            }
                        },
                        {
                            model: OrderedProducts,
                            include: {
                                model: Products,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"]
                                },
                            }
                        }, {
                            model: TransactionFiat
                        }, {
                            model: TransactionCrypto
                        },
                        {
                            model: CollectedCoupon,
                            attributes: ["is_coupon"],
                            include: {
                                model: Coupon,
                                attributes: ["coupon_name", "percent_off", "coupon_image", "max_discount"]
                            }
                        },
                    ],

                }).then((orderList) => response.success(res, "", orderList))
                .catch((err) => {
                    console.log('Error:::', err);
                    return response.error(res, "Error occurred, please try after some time!")
                })

        } catch (error) {
            console.log('Error:::', error);
            return response.error(res, error.message);
        }

    };

    const cancelOrder = async (req, res) => {
        try {
            const cancelFeeTemp = 10;
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                orderId: JOI.number().integer().required(),
                cancelReason: JOI.string().max(300).optional(),
                orderCancelCharges: JOI.number().optional(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            let orderObj = await Orders.findOne({
                where: {
                    userId: user.data.user_id,
                    orderId: body.orderId,
                    isOrderDeleted: false,
                },
            });

            if (orderObj && orderObj.orderId) {
                if (orderObj.orderStatus == 'CANCELLED_BY_USER' || orderObj.orderStatus == 'CANCELLED_BY_MERCHANT')
                    return response.error(res, "Order is already cancelled");
                else {
                    orderObj.orderStatus = 'CANCELLED_BY_USER';
                    orderObj.orderCancelCharges = body.orderCancelCharges || cancelFeeTemp;
                    if (body.cancelReason)
                        orderObj.cancelReason = body.cancelReason;

                    orderObj
                        .save()
                        .then(() => response.success(res, "Order cancelled successfully"))
                        .catch((err) => response.error(res, "Order cancellation failed, try later!"))
                }
            } else
                return response.error(res, "Order not found");
        } catch (error) {
            console.log('Error:::', error);
            return response.error(res, error.message);
        }

    };

    return {
        createOrder,
        getOrderById,
        getAllOrders,
        cancelOrder,
    };
};

module.exports = OrderController;


async function sendCreateOrderNotification(orderObj) {

    if (!orderObj)
        return;

    if (orderObj.orderType == 'DELIVERY' && orderObj.addressId) {
        await orderObj.reload({
            include: {
                model: UserAddress
            }
        });
    }

    Fcm.findAll({
        attributes: ["fcm_token"],
        include: {
            required: true,
            model: User,
            attributes: [],
            include: {
                attributes: [],
                required: true,
                model: Outlet,
                where: {
                    id: orderObj.outletId
                }
            }
        }
    }).then(fcmArr => {
        if (fcmArr && fcmArr.length > 0) {
            var userFcmsArray = [];
            fcmArr.forEach(fcmObj => {
                userFcmsArray.push(fcmObj.fcm_token);
            });
            var title = "New Order";
            var msg = "New Order";
            var jsonData = {};
            jsonData.title = title;
            jsonData.message = msg;
            jsonData.orderData = orderObj;
            if (userFcmsArray.length > 0) {
                var firebaseMsg = new FirebaseMessaging(userFcmsArray, title, msg, jsonData);
                firebaseMsg.send();
            }

        } else {
            console.log("order create notification not sent because merchant fcm not found. TAK")
        }
    });
}

async function rollbackTxn(txn) {
    if (txn)
        txn.rollback();
}