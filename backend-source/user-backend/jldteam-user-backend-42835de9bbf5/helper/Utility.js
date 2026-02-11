/** Model */
const User = require('../models/User');

const Fcm = require('../models/Fcm');
const Coins = require('../models/Coins');
const UserWalletFiat = require('../models/UserWalletFiat');
const UserWalletCrypto = require('../models/UserWalletCrypto');
const RewardWalletCrypto = require('../models/ARM_RewardWalletCrypto');

const TransactionCrypto = require('../models/TransactionCrypto');
const TransactionFiat = require('../models/TransactionFiat');
const Role = require('../models/Role');
const CryptoAddresses = require('../models/CryptoAddresses');

const TBLBANKRemoteDontEdit = require('../models/TBLBANKRemoteDontEdit');

/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');
const JOI = require('joi');
const sequelize = require('../config/database');
const Sequelize = require('sequelize');
const FirebaseMessaging = require('../helper/FirebaseMessaging');
const axios = require('axios')
const commonConstants = require('../constants/commonConstants').commonConstants;

/* 
@author : TAK
utility for common methods used in app.
*/

module.exports = {

    getAdminCryptoWallet: async (coinId, txn) => {
        if (!txn)
            return null;
        const adminUser = await User.findOne({
            where: {
                isDeleted: false,
                user_status: 'active',
            },
            include: [{
                    required: true,
                    model: Role,
                    where: {
                        name: 'admin'
                    }
                },
                {
                    required: true,
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "userId"]
                    },
                    model: UserWalletCrypto,
                    where: {
                        coinId: coinId,
                    },
                },

            ],
            transaction: txn
        });

        return adminUser;
    },

    getUserCryptoWallet: async (userId, coinId, txn) => {
        if (!txn)
            return null;
        const userObj = await User.findOne({
            where: {
                id: userId,
                isDeleted: false,
                user_status: 'active',
            },
            include: [{
                    required: true,
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "userId"]
                    },
                    model: UserWalletCrypto,
                    where: {
                        coinId: coinId,
                    },
                },

            ],
            transaction: txn
        });
        return userObj;
    },

    getUserCryptoWalletWithEmailOrPhone: async (email, phoneNumber, coinId, txn) => {
        if (!txn)
            return null;

        if (!email && !phoneNumber)
            return null;

        var whereStr = {};
        whereStr.isDeleted = false;
        whereStr.user_status = 'active';
        if (!email)
            whereStr.contact_no = phoneNumber;
        else if (!phoneNumber)
            whereStr.email = email;


        const userObj = await User.findOne({
            where: whereStr,
            include: [{
                required: true,
                attributes: {
                    exclude: ["createdAt", "updatedAt", "userId"]
                },
                model: UserWalletCrypto,
                where: {
                    coinId: coinId
                }
            }, ],
            transaction: txn
        });
        return userObj;
    },

    getUserFiatWalletWithEmailOrPhone: async (email, phoneNumber, txn) => {
        if (!txn)
            return null;

        if (!email && !phoneNumber)
            return null;

        var whereStr = {};
        whereStr.isDeleted = false;
        whereStr.user_status = 'active';
        if (!email)
            whereStr.contact_no = phoneNumber;
        else if (!phoneNumber)
            whereStr.email = email;

        const userObj = await User.findOne({
            where: whereStr,
            include: [{
                required: true,
                attributes: {
                    exclude: ["createdAt", "updatedAt", "userId"]
                },
                model: UserWalletFiat,
            }, ],
            transaction: txn
        });
        return userObj;
    },
    getUserFiatWallet: async (userId, txn) => {
        if (!txn)
            return null;
        const userObj = await User.findOne({
            where: {
                id: userId,
                isDeleted: false,
                user_status: 'active',
            },
            include: [{
                    required: true,
                    model: Role,
                    where: {
                        name: 'user'
                    }
                }, {
                    required: true,
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "userId"]
                    },
                    model: UserWalletFiat,
                },

            ],
            transaction: txn
        });
        return userObj;
    },

    getAdminFiatWallet: async (txn) => {
        if (!txn)
            return null;
        const adminUser = await User.findOne({
            where: {
                isDeleted: false,
                user_status: 'active',
            },
            include: [{
                    required: true,
                    model: Role,
                    where: {
                        name: 'admin'
                    }
                },
                {
                    required: true,
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "userId"]
                    },
                    model: UserWalletFiat,
                },

            ],
            transaction: txn
        });

        return adminUser;
    },

    getUserCryptoWalletsAll: async (userId) => {
        const userObj = await User.findOne({
            where: {
                id: userId,
                isDeleted: false,
                user_status: 'active',
            },
            include: [{
                    required: true,
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "userId"]
                    },
                    model: UserWalletCrypto,
                    include: {
                        attributes: {
                            exclude: ["createdAt", "updatedAt", "userId"]
                        },
                        model: Coins
                    }
                },

            ],
        });
        return userObj;
    },

    getUserRewardWalletITC: async (userId, coinId, txn) => {
        if (!txn)
            return null;
        const rewardWalletITC = await RewardWalletCrypto.findOne({
            where: {
                userId: userId,
                coinId: coinId,
            },
            transaction: txn
        });
        return rewardWalletITC;
    },

    getAdminRewardWalletITC: async (coinId, txn) => {
        if (!txn)
            return null;
        const adminRewardWalletITC = await RewardWalletCrypto.findOne({
            where: {
                coinId: coinId,
            },
            include: {
                required: true,
                attributes: ["id"],
                model: User,
                include: {
                    attributes: [],
                    required: true,
                    model: Role,
                    where: {
                        name: 'admin'
                    }
                }
            },
            transaction: txn
        });

        return adminRewardWalletITC;
    },

    makeUserToAdminCryptoTxn: async (userId, amountCrypto, coinId, txn) => {
        if (!txn)
            throw new Error("db txn not init.");

        const userCryptoWallet = await UserWalletCrypto.findOne({
            where: {
                coinId: coinId,
                userId: userId
            },
            transaction: txn
        });

        if (!userCryptoWallet)
            throw new Error("user crypto wallet not found");

        if (Number(userCryptoWallet.balanceCrypto) < Number(amountCrypto))
            throw new Error("Insufficient balance");


        const adminCryptoWallet = await UserWalletCrypto.findOne({
            where: {
                coinId: coinId,
            },
            include: {
                required: true,
                attributes: ["id"],
                model: User,
                include: {
                    attributes: [],
                    required: true,
                    model: Role,
                    where: {
                        name: 'admin'
                    }
                }
            },
            transaction: txn
        });

        if (!adminCryptoWallet)
            throw new Error("admin crypto wallet not found");

        var cryptoTxn = {
            amountCrypto: amountCrypto,
            debitWallet: userCryptoWallet.walletIdCrypto,
            creditWallet: adminCryptoWallet.walletIdCrypto,
            txnInitiater: userId,
            coinId: coinId,
            comments: "Paid for Ad posting",
            status: 'CONFIRMED',
            txnType: 'USER_AD_POST',
            blockChainAddress: 'AD Post'
        }

        var cryptoTxnObj = await TransactionCrypto.create(cryptoTxn, {
            transaction: txn
        })

        if (!cryptoTxnObj)
            throw new Error("Error in creating txn, please try again");

        await adminCryptoWallet.increment('balanceCrypto', {
            by: amountCrypto,
            transaction: txn
        });

        await userCryptoWallet.decrement('balanceCrypto', {
            by: amountCrypto,
            transaction: txn
        });

        return cryptoTxnObj.cryptoTxnId;
    },

    getUserCryptoWalletWithEmailMerchant: async (email, coinId, txn) => {
        if (!txn)
            return null;

        if (!email && !phoneNumber)
            return null;

        var whereStr = {};
        whereStr.isDeleted = false;
        whereStr.user_status = 'active';
        whereStr.merchant_email = email;

        const userObj = await User.findOne({
            where: whereStr,
            include: [{
                required: true,
                attributes: {
                    exclude: ["createdAt", "updatedAt", "userId"]
                },
                model: UserWalletCrypto,
                where: {
                    coinId: coinId
                }
            }, ],
            transaction: txn
        });
        return userObj;
    },
}