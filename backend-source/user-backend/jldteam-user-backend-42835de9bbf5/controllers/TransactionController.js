/** Model */
const User = require('../models/User');

const Coins = require('../models/Coins');
const UserWalletFiat = require('../models/UserWalletFiat');
const UserWalletCrypto = require('../models/UserWalletCrypto');
const TransactionCrypto = require('../models/TransactionCrypto');
const TransactionFiat = require('../models/TransactionFiat');
const TransactionCryptoReward = require('../models/ARM_RewardTxnCrypto');


const TBLBANKRemoteDontEdit = require('../models/TBLBANKRemoteDontEdit');
const TBLBANK = require('../models/TBLBANK');



/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');
const JOI = require('joi');
const Sequelize = require('sequelize');
var moment = require('moment');
const commonConstants = require('../constants/commonConstants').commonConstants;
const sequelize = require('../config/database');




const TransactionController = () => {

    const getCryptoTxns = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {});

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var txnsList = await User.findOne({
                attributes: [],
                where: {
                    id: user.data.user_id,
                },
                include: [{
                    attributes: ["walletIdCrypto"],
                    model: UserWalletCrypto,
                    include: [{
                            attributes: ["coinId", "coinName"],
                            model: Coins,
                        }, {
                            attributes: {
                                exclude: ["txnInitiater", "debitWallet", "creditWallet", "coinId", "softDelete"]
                            },
                            model: TransactionCrypto,
                            as: "DebitTxnsCrypto",
                            include: [{
                                attributes: ["userId"],
                                model: UserWalletCrypto,
                                as: "CreditWallet",
                                include: {
                                    model: User,
                                    attributes: ["full_name"]
                                }
                            }]
                        },
                        {
                            attributes: {
                                exclude: ["txnInitiater", "debitWallet", "creditWallet", "coinId", "softDelete"]
                            },
                            model: TransactionCrypto,
                            as: "CreditTxnsCrypto",
                            include: [{
                                    attributes: ["userId"],
                                    model: UserWalletCrypto,
                                    as: "DebitWallet",
                                    include: {
                                        model: User,
                                        attributes: ["full_name"]
                                    }
                                },
                                {
                                    required: false,
                                    model: TransactionFiat,
                                    as: "RefKrwToCryptoTxn",
                                    attributes: ["fiatTxnId", "amount", "fee", "status", "txnType", "comments", "createdAt"]
                                }
                            ]
                        }
                    ]
                }]
            });

            return response.success(res, constant.SUCCESS, {
                txnsList: txnsList.UserWalletCryptos
            });

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const getFiatTxns = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {});

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var txnsList = await User.findOne({
                attributes: [],
                where: {
                    id: user.data.user_id,
                },
                include: [{
                    attributes: ["walletIdFiat"],
                    model: UserWalletFiat,
                    include: [{
                            attributes: {
                                exclude: ["txnInitiater", "debitWallet", "creditWallet", "softDelete", "Bkid"]
                            },
                            model: TransactionFiat,
                            as: "DebitTxnsFiat",
                            include: [{
                                attributes: ["userId"],
                                model: UserWalletFiat,
                                as: "CreditWalletFiat",
                                include: {
                                    model: User,
                                    attributes: ["full_name"]
                                }
                            }]
                        },
                        {
                            attributes: {
                                exclude: ["txnInitiater", "debitWallet", "creditWallet", "softDelete", "Bkid"]
                            },
                            model: TransactionFiat,
                            as: "CreditTxnsFiat",
                            include: [{
                                attributes: ["userId"],
                                model: UserWalletFiat,
                                as: "DebitWalletFiat",
                                include: {
                                    model: User,
                                    attributes: ["full_name"]
                                }
                            }, {
                                required: false,
                                model: TransactionCryptoReward,
                                attributes: ["cryptoTxnId", "amountCrypto", "feeCrypto", "status", "comments", "createdAt", "updatedAt"],
                            }]
                        }
                    ]
                }]
            });

            return response.success(res, constant.SUCCESS, {
                debitTxns: (txnsList && txnsList.UserWalletFiat) ? txnsList.UserWalletFiat.DebitTxnsFiat || [] : [],
                creditTxns: (txnsList && txnsList.UserWalletFiat) ? txnsList.UserWalletFiat.CreditTxnsFiat || [] : []
            });

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const updatePendingFiatBankTxn = async (req, res) => {
        var txn = null;
        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                fiatTxnId: JOI.number().integer().required(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            txn = await sequelize.transaction({
                lock: Sequelize.Transaction.LOCK.UPDATE,
                isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
            });

            var txnObj = await TransactionFiat.findOne({
                where: {
                    fiatTxnId: body.fiatTxnId,
                    txnType: 'WALLET_TOPUP',
                },

                include: [{
                    required: true,
                    model: UserWalletFiat,
                    as: "CreditWalletFiat",
                    attributes: {
                        exclude: ["status", "softDelete", "createdAt", "updatedAt", "userId"]
                    },
                    include: {
                        model: User,
                        attributes: ["full_name"],
                        where: {
                            id: user.data.user_id,
                        }
                    }
                }, ],
                transaction: txn
            });

            if (!txnObj)
                return response.error(res, "Transaction not found");

            if (txnObj.status.toUpperCase() != 'PENDING')
                return response.error(res, "Transaction is not pending.");

            var bankTxn = await TBLBANKRemoteDontEdit.findAll({
                where: {
                    Bkinput: txnObj.amount,
                    Bkjukyo: {
                        [Sequelize.Op.startsWith]: txnObj.CreditWalletFiat.User.full_name.substring(0, 3),
                    }
                }
            });


            //check if bank transations found. TAK
            if (bankTxn && bankTxn.length > 0) {
                var txnDateTime = moment(txnObj.createdAt).utcOffset("+09:00");

                for (let bnkTxn of bankTxn) {
                    var bnkTxnDateTime = moment(bnkTxn.Bkdate + " " + bnkTxn.Bktime, "YYYYMMDD HHmmss").utcOffset("+09:00");
                    var diff = bnkTxnDateTime.diff(txnDateTime, 'minutes'); // The supported measurements are years, months, weeks, days, hours, minutes, and seconds

                    //check if found bank txn is withing allowed time limit. TAK
                    if (diff >= 0 && diff <= commonConstants.VALID_TXN_DIFF_TIME_IN_MINUTE) {

                        var tblTxn = await TBLBANK.create(bnkTxn.dataValues, {
                            transaction: txn
                        });
                        console.log("updatePendingFiatBankTxn: inserting done bank txn to local bank table TBLBANK.Bkid= " + tblTxn.Bkid + " . TAK")

                        txnObj.bankdaRefId = tblTxn.Bkid;
                        txnObj.status = 'CONFIRMED';

                        console.log("updatePendingFiatBankTxn: updating txn status to Confirm. TAK")
                        await txnObj.save({
                            transaction: txn
                        })

                        console.log("updatePendingFiatBankTxn: crediting balance for txn id " + txnObj.fiatTxnId + " to user wallet. TAK")
                        await txnObj.CreditWalletFiat.increment('balanceKRW', {
                            by: txnObj.amount,
                            transaction: txn
                        });

                        await txnObj.reload({
                            transaction: txn
                        })
                        await txn.commit();

                        return response.success(res, constant.SUCCESS, {
                            fiatTxn: txnObj
                        });

                    }
                }

            }

            return response.error(res, "Transaction not confirmed yet.");

        } catch (error) {
            console.error('Error::', error);
            if (txn) txn.rollback();
            return response.error(res, error.message);
        }

    };

    return {
        getCryptoTxns,
        getFiatTxns,
        updatePendingFiatBankTxn,
        // getTxns,
        // getCryptoTxnById,
        // getFiatTxnById,
    };
};

module.exports = TransactionController;