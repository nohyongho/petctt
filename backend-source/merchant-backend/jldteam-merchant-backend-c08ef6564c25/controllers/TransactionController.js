/** Model */
const sequelize = require('../config/database');
const User = require('../models/User');
const UserDetail = require('../models/UserDetail');
const UserVerification = require('../models/UserVerification');
const CountryList = require('../models/CountryList');
const StateList = require('../models/StateList');
const CityList = require('../models/CityList');
const Role = require('../models/Role');
const Brand = require('../models/Brand');
const Outlet = require('../models/Outlet');
const MpUserOutlet = require('../models/MpUserOutlet');
const Coin = require('../models/Coin');

const UserWalletCrypto = require('../models/UserWalletCrypto');
const UserWalletFiat = require('../models/UserWalletFiat');
const TransactionFiat = require('../models/TransactionFiat');
const TransactionCrypto = require('../models/TransactionCrypto');
const MerchantOrders = require('../models/MerchantOrders');

/** Keys */
const keys = require('../config/keys');

/**Services  */
const uploadImage = require('../services/imageUpload.service');

/** Helpers */
const response = require('../helper/response');
const responseMessages = require('../helper/responseMessages');
const constant = require('../constants/ConstantMessages');
const validate = require('../helper/validators/TransactionValidator');
const mailer = require('../services/mailer.service');
const bcryptService = require('../services/bcrypt.service');
const authService = require('../services/auth.service');
const pug = require('pug');

/** Library */
const Sequelize = require('sequelize');
var moment = require('moment');
const Op = Sequelize.Op;
const crypto = require('crypto');
const path = require('path');




const TransactionController = () => {




    const getadminWallets = async(req, res) => {

        try {


            const { user } = req;
            const validationResponse = validate.getadminwallet(req.body);

            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            const foundadmin = await User.findOne({
                where: {
                    role_id: 3,
                },

            });

            // console.log(foundadmin.id)

            const foundUser = await User.findOne({
                where: {
                    id: foundadmin.id,
                },
                include: [{
                        required: true,
                        attributes: {
                            exclude: ["createdAt", "updatedAt", "userId"]
                        },
                        model: UserWalletFiat
                    },
                    {
                        required: true,
                        attributes: {
                            exclude: ["createdAt", "updatedAt", "userId"]
                        },
                        model: UserWalletCrypto,
                        include: {
                            attributes: {
                                exclude: ["createdAt", "updatedAt"]
                            },
                            required: true,
                            model: Coin,
                            where: {
                                soft_delete: false
                            }
                        }
                    },

                ]
            });


            // return response.successDT(res, constant.SUCCESS, testData, OutletData.length, OutletData.length);


            let WalletFiat = (foundUser == null) ? 'No Fiat Wallet found against this merchant' : foundUser.UserWalletFiats;
            let WalletCrypto = (foundUser == null) ? 'No crypto Wallet found against this merchant' : foundUser.UserWalletCryptos;
            if (foundUser == null) {

                return response.error(res, constant.NO_RECORD);

            } else {

                return response.success(res, constant.SUCCESS, {


                    userWalletFiat: WalletFiat,
                    userWalletCrypto: WalletCrypto,
                });

            }

        } catch (error) {
            console.log('Error::', error);
            return response.error(res, error.message);
        }

    };

    const sendfiat = async(req, res) => {
        const { user } = req;

        const foundadmin = await User.findOne({
            where: {
                role_id: 3,
            },

        });

        const foundadminwallet = await UserWalletFiat.findOne({
            where: {
                user_id: foundadmin.id,
            },

        });



        var adminwalletid = foundadminwallet.id

        const body = req.body;
        let foundWallet = await UserWalletFiat.findOne({ where: { user_id: user.data.user_id } });
        if (!foundWallet) {
            return response.error(res, "No Fiat Wallet Found against this merchant");
        }
        try {

            const validationResponse = validate.sendfiat(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            /**inserting transaction  record */
            let NewTransactionFiat = await TransactionFiat.create({

                referrence_txn_id: body.referrence_txn_id,
                debit_wallet_id: adminwalletid,
                credit_wallet_id: foundWallet.dataValues.id,
                txn_initiater_user_id: user.data.user_id,
                amount_krw: body.amount_krw,
                fee_krw: body.fee_krw,
                txn_type: body.txn_type,
                comments: body.comments,
                status: true,
                soft_delete: false,
            });
            return response.success(res, constant.SUCCESS, { transaction_fiat_id: NewTransactionFiat.id });

        } catch (error) {

            return response.error(res, error.message);
        }

    };


    const sendcrypto = async(req, res) => {

        const body = req.body;
        const { user } = req;
        const foundadmin = await User.findOne({
            where: {
                role_id: 3,
            },

        });

        const foundadminwallet = await UserWalletCrypto.findOne({
            where: {
                user_id: foundadmin.id,
            },

        });



        var adminwalletid = foundadminwallet.id


        let foundWallet = await UserWalletCrypto.findOne({ where: { user_id: user.data.user_id } });

        if (!foundWallet) {
            return response.error(res, "No Crypto Wallet Found against this merchant");
        }
        try {


            const validationResponse = validate.sendcrypto(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            /**inserting transaction  record */
            let NewTransactionCrypto = await TransactionCrypto.create({

                referrence_txn_id: body.referrence_txn_id,
                blockchain_address: body.blockchain_address,
                debit_wallet_id: adminwalletid,
                credit_wallet_id: foundWallet.dataValues.id,
                txn_initiater_user_id: user.data.user_id,
                amount_crypto: body.amount_crypto,
                coin_id: body.coin_id,
                fee_crypto: 2,
                txn_type: body.txn_type,
                comments: body.comments,
                status: 'PENDING',
                soft_delete: false,


            });

            return response.success(res, constant.SUCCESS, { transaction_crypto_id: NewTransactionCrypto.id });

        } catch (error) {

            return response.error(res, error.message);
        }

    };


    const Topupwalletfiat = async(req, res) => {
        const { user } = req;



        const foundadmin = await User.findOne({
            where: {
                role_id: 3,
            },

        });

        const foundadminwallet = await UserWalletFiat.findOne({
            where: {
                user_id: foundadmin.id,
            },

        });



        var adminwalletid = foundadminwallet.id
        const body = req.body;
        let foundWallet = await UserWalletFiat.findOne({ where: { user_id: user.data.user_id } });
        if (!foundWallet) {
            return response.error(res, "No Fiat Wallet Found against this merchant");
        }
        try {

            const validationResponse = validate.sendfiat(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            /**inserting transaction  record */
            let NewTransactionFiat = await TransactionFiat.create({

                referrence_txn_id: body.referrence_txn_id,
                debit_wallet_id: adminwalletid,
                credit_wallet_id: foundWallet.dataValues.id,
                txn_initiater_user_id: user.data.user_id,
                amount_krw: body.amount_krw,
                fee_krw: 0,
                txn_type: 'WALLET_TOPUP',
                comments: body.comments,
                status: 'PENDING',
                soft_delete: false,


            });
            return response.success(res, constant.FIATWALLET_TOPUP_SUCCESS, { transaction_fiat_id: NewTransactionFiat.id });

        } catch (error) {

            return response.error(res, error.message);
        }

    };




    const Topupwalletcrypto = async(req, res) => {
        const body = req.body;
        const { user } = req;



        const foundadmin = await User.findOne({
            where: {
                role_id: 3,
            },

        });

        const foundadminwallet = await UserWalletCrypto.findOne({
            where: {
                user_id: foundadmin.id,
            },

        });



        var adminwalletid = foundadminwallet.id



        let foundWallet = await UserWalletCrypto.findOne({ where: { user_id: user.data.user_id } });

        if (!foundWallet) {
            return response.error(res, "No Crypto Wallet Found against this merchant");
        }
        try {

            const validationResponse = validate.Topupwalletcrypto(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            /**inserting transaction  record */
            let NewTransactionCrypto = await TransactionCrypto.create({

                referrence_txn_id: body.referrence_txn_id,
                blockchain_address: body.blockchain_address,
                debit_wallet_id: adminwalletid,
                credit_wallet_id: foundWallet.dataValues.id,
                txn_initiater_user_id: user.data.user_id,
                amount_crypto: body.amount_crypto,
                coin_id: body.coin_id,
                fee_crypto: 0,
                txn_type: 'WALLET_TOPUP',
                comments: body.comments,
                status: 'PENDING',
                soft_delete: false,


            });
            return response.success(res, constant.CRYPTOWALLET_TOPUP_SUCCESS, { transaction_crypto_id: NewTransactionCrypto.id });

        } catch (error) {

            return response.error(res, error.message);
        }

    };


    const TransactionHistoryCrypto = async(req, res) => {

        const body = req.body;
        const { user } = req;

        let foundWallet = await UserWalletCrypto.findOne({ where: { user_id: user.data.user_id } });
        if (!foundWallet) {
            return response.error(res, "No Crypto Wallet Found against this merchant");
        }
        try {

            let TransactionHistory = await TransactionCrypto.findAll({
                where: [{
                    txn_initiater_user_id: user.data.user_id,
                }],
                order: [
                    ['createdAt', 'desc']
                ],
                limit: parseInt(req.body.limit),
                offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1))
            });
            recordsTotal = TransactionHistory.length;
            recordsFiltered = TransactionHistory.length;
            return response.successDT(res, constant.SUCCESS, TransactionHistory, recordsTotal, recordsFiltered);
        } catch (error) {

            return response.error(res, error.message);
        }
    };


    const TransactionHistoryFiat = async(req, res) => {

        const body = req.body;
        const { user } = req;

        let foundWallet = await UserWalletFiat.findOne({ where: { user_id: user.data.user_id } });
        if (!foundWallet) {
            return response.error(res, "No Fiat Wallet Found against this merchant");
        }
        try {

            let TransactionHistory = await TransactionFiat.findAll({
                where: [{
                    txn_initiater_user_id: user.data.user_id,
                }],
                order: [
                    ['createdAt', 'desc']
                ],
                limit: parseInt(req.body.limit),
                offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1))
            });
            recordsTotal = TransactionHistory.length;
            recordsFiltered = TransactionHistory.length;
            return response.successDT(res, constant.SUCCESS, TransactionHistory, recordsTotal, recordsFiltered);
        } catch (error) {

            return response.error(res, error.message);
        }
    };



    /**Cancel Transaction Crypto By merchant*/
    const CancelTransactionCrypto = async(req, res) => {
        try {
            const body = req.body;
            const { user } = req;
            // const confirmPassword = req.body.confirmPassword
            const validationResponse = validate.canceltransaction(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            let transactioncryptofound = await TransactionCrypto.findOne({
                where: {
                    id: body.txn_id,
                    txn_initiater_user_id: user.data.user_id,
                    status: {
                        [Op.not]: "CANCELLED"
                    },

                }
            });
            if (transactioncryptofound) {

                let updatetransactiondata = await TransactionCrypto.update({
                    status: "CANCELLED",
                }, {
                    where: { id: body.txn_id, txn_initiater_user_id: user.data.user_id }
                });
                if (updatetransactiondata[0] === 1) {
                    response.successMsg(res, constant.TRANSACTION_CANCELLED);
                } else {
                    return response.error(res, constant.TRANSACTION_NOTCANCELLED);
                }

            } else {
                return response.error(res, constant.TRANSACTION_NOTFOUND_ALREADYCANCELLED);
            }
        } catch (error) {
            return response.error(res, error.message);
        }
    };

    /**Cancel Transaction Fiat By merchant*/
    const CancelTransactionFiat = async(req, res) => {
        try {
            const body = req.body;
            const { user } = req;
            // const confirmPassword = req.body.confirmPassword
            const validationResponse = validate.canceltransaction(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            let transactionfound = await TransactionFiat.findOne({
                where: {
                    id: body.txn_id,
                    txn_initiater_user_id: user.data.user_id,
                    status: {
                        [Op.not]: "CANCELLED"
                    },

                }
            });
            if (transactionfound) {

                let updatetransactiondata = await TransactionFiat.update({
                    status: "CANCELLED",
                }, {
                    where: { id: body.txn_id, txn_initiater_user_id: user.data.user_id }
                });
                if (updatetransactiondata[0] === 1) {
                    response.successMsg(res, constant.TRANSACTION_CANCELLED);
                } else {
                    return response.error(res, constant.TRANSACTION_NOTCANCELLED);
                }

            } else {
                return response.error(res, constant.TRANSACTION_NOTFOUND_ALREADYCANCELLED);
            }
        } catch (error) {
            return response.error(res, error.message);
        }
    };


    return {

        getadminWallets,
        sendfiat,
        sendcrypto,
        Topupwalletcrypto,
        Topupwalletfiat,
        TransactionHistoryCrypto,
        TransactionHistoryFiat,
        CancelTransactionCrypto,
        CancelTransactionFiat,


    };
};

module.exports = TransactionController;