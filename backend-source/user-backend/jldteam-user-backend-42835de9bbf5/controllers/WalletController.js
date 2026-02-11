/** Model */
const User = require('../models/User');
const Role = require('../models/Role');



const Coins = require('../models/Coins');
const UserWalletFiat = require('../models/UserWalletFiat');
const UserWalletCrypto = require('../models/UserWalletCrypto');
const TransactionCrypto = require('../models/TransactionCrypto');
const TransactionFiat = require('../models/TransactionFiat');
const CryptoAddresses = require('../models/CryptoAddresses');
const RewardWalletCrypto = require('../models/ARM_RewardWalletCrypto');
const TransactionCryptoReward = require('../models/ARM_RewardTxnCrypto');




/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');
const JOI = require('joi');
const sequelize = require('../config/database');
const Sequelize = require('sequelize');
const axios = require('axios')
const commonConstants = require('../constants/commonConstants').commonConstants;
const Utility = require('../helper/Utility');

const WalletController = () => {

    const getITCaddress = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {});

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var callResponse = await axios.post(commonConstants.CREATE_ITC_ADDRESS_URL, {
                symbol: 'itc'
            });
            // .then((res) => {
            //     console.log(`statusCode: ${res.statusCode}`)
            //     console.log(res)
            // })
            // .catch((error) => {
            //     console.error(error)
            // })

            var coinObj = await Coins.findOne({
                where: {
                    coinName: "Intercash"
                }
            });

            if (callResponse.status && callResponse.data.account) {

                var cryptoAddress = await CryptoAddresses.create({
                    coinId: coinObj.coinId,
                    userId: user.data.user_id,
                    address: callResponse.data.account.address
                });

                if (cryptoAddress) {
                    return response.success(res, constant.SUCCESS, {
                        address: callResponse.data.account.address,
                    });
                } else {
                    console.error('Error::', cryptoAddress);
                    return response.error(res, "Error in creating address, please try later. Error ECITC0001");
                }

            } else {
                console.error('Error::', callResponse);
                return response.error(res, "Error in creating address, please try later. Error ECITC0002");
            }

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const getWallets = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {});

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            const foundUser = await User.findOne({
                where: {
                    id: user.data.user_id,
                },
                include: [{
                        required: false,
                        attributes: {
                            exclude: ["createdAt", "updatedAt", "userId"]
                        },
                        model: UserWalletFiat,
                    },
                    {
                        required: false,
                        attributes: {
                            exclude: ["createdAt", "updatedAt", "userId"]
                        },
                        model: UserWalletCrypto,
                        include: {
                            attributes: {
                                exclude: ["createdAt", "updatedAt"]
                            },
                            required: true,
                            model: Coins,
                            where: {
                                softDelete: false
                            }
                        }
                    },
                    {
                        required: false,
                        attributes: {
                            exclude: ["createdAt", "updatedAt", "userId"]
                        },
                        model: RewardWalletCrypto,
                        include: {
                            attributes: {
                                exclude: ["createdAt", "updatedAt"]
                            },
                            required: true,
                            model: Coins,
                        }
                    },

                ]
            });

            if (!foundUser)
                return response.error(res, "Wallet/s not found");

            return response.success(res, constant.SUCCESS, {
                userWalletFiat: foundUser.UserWalletFiat,
                userWalletCrypto: foundUser.UserWalletCryptos,
                userRewardWalletCrypto: foundUser.RewardWalletCryptos
            });

        } catch (error) {
            console.log('Error::', error);
            return response.error(res, error.message);
        }

    };

    const topUpCrypto = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                amountCrypto: JOI.number().precision(8).strict().required(),
                coinId: JOI.number().integer().strict().required(),
                blockChainAddress: JOI.string().min(3).max(255).required(),
                // feeCrypto: JOI.number().precision(8).allow(null).optional(),
                comments: JOI.string().max(200).allow(null).optional(),
            });

            body.txnType = 'WALLET_TOPUP';

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var txn = null;
            try {
                txn = await sequelize.transaction({
                    lock: Sequelize.Transaction.LOCK.UPDATE,
                    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
                });
                var userObj = await Utility.getUserCryptoWallet(user.data.user_id, body.coinId, txn);

                if (!userObj) {
                    rollbackTxn(txn);
                    return response.error(res, "user wallet not found");
                }
                var adminUser = await Utility.getAdminCryptoWallet(body.coinId, txn);

                if (!adminUser) {
                    rollbackTxn(txn);
                    return response.error(res, "admin wallet not found");
                }

                body.debitWallet = adminUser.UserWalletCryptos[0].walletIdCrypto;
                body.creditWallet = userObj.UserWalletCryptos[0].walletIdCrypto;
                body.txnInitiater = user.data.user_id;

                var txnObj = await TransactionCrypto.create(body, {
                    transaction: txn
                })

                await txn.commit();

                console.log("topUpCrypto request created success. txn id =" + txnObj.cryptoTxnId + "  TAK");

                return response.success(res, "Top up request created successfully", {
                    txnObj
                });

            } catch (err) {
                console.error('Error::', err);
                if (txn) txn.rollback();
                return response.error(res, "Error in creating request. CWR0001");
            }

        } catch (error) {
            console.log('Error::', error);
            return response.error(res, error.message);
        }

    };

    const sendCrypto = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                email: JOI.string().email().allow(''),
                phoneNumber: JOI.string().trim().regex(/^\+(?:[0-9]●?){6,16}[0-9]$/).allow(''),
                amountCrypto: JOI.number().precision(8).strict().required(),
                coinId: JOI.number().integer().strict().required(),
                comments: JOI.string().max(200).allow(null).optional(),
            });

            body.txnType = 'TRANSFER';
            body.status = 'CONFIRMED';
            body.blockChainAddress = 'INTERNAL TRANSFER';

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            if (!body.email && !body.phoneNumber) {
                return response.error(res, "Email or Phone is required. Error SWT0001");
            }

            var txn = null;

            try {
                txn = await sequelize.transaction({
                    lock: Sequelize.Transaction.LOCK.UPDATE,
                    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
                });

                var creditUserObj = await Utility.getUserCryptoWalletWithEmailOrPhone(body.email, body.phoneNumber, body.coinId, txn);
                if (!creditUserObj) {
                    txn.rollback();
                    return response.errorWithCode(res, "Receiver email/phone not found.", "RWNFC0023");
                }
                var debitUserObj = await Utility.getUserCryptoWallet(user.data.user_id, body.coinId, txn);
                if (!debitUserObj) {
                    txn.rollback();
                    return response.errorWithCode(res, "your wallet not found.", "SWNTC0045");
                }

                var debitWalletObj = debitUserObj.UserWalletCryptos[0];
                var creditWalletObj = creditUserObj.UserWalletCryptos[0];

                if (creditUserObj.id == debitUserObj.id) {
                    txn.rollback();
                    return response.error(res, "Can not send to self. Error SWT0002");
                }

                if (body.amountCrypto > debitWalletObj.balanceCrypto) {
                    txn.rollback();
                    return response.error(res, "Insufficient balance");
                }

                body.debitWallet = debitWalletObj.walletIdCrypto;
                body.creditWallet = creditWalletObj.walletIdCrypto;
                body.txnInitiater = user.data.user_id;

                var txnObj = await TransactionCrypto.create(body, {
                    transaction: txn
                })

                await debitWalletObj.decrement('balanceCrypto', {
                    by: body.amountCrypto,
                    transaction: txn
                });

                await creditWalletObj.increment('balanceCrypto', {
                    by: body.amountCrypto,
                    transaction: txn
                });

                await debitWalletObj.reload({
                    transaction: txn
                })
                await txn.commit();

                return response.success(res, "Balance transferred successfully", {
                    txnObj: {
                        coinId: txnObj.coinId,
                        status: txnObj.status,
                        cryptoTxnId: txnObj.cryptoTxnId,
                    },
                    updatedBalance: debitWalletObj.balanceCrypto
                });

            } catch (err) {
                console.error('Error::', err);
                if (txn) txn.rollback();
                return response.error(res, "Error in creating request. Error SWT0003");
            }

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const sendFiat = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                email: JOI.string().email().allow(''),
                phoneNumber: JOI.string().trim().regex(/^\+(?:[0-9]●?){6,16}[0-9]$/).allow(''),
                amount: JOI.number().integer().strict().required(),
                comments: JOI.string().max(200).allow(null).optional(),
            });

            body.txnType = 'TRANSFER';
            body.status = 'CONFIRMED';

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            if (!body.email && !body.phoneNumber) {
                return response.error(res, "Email or Phone is required. Error SWT0001");
            }

            var txn = null;

            try {
                txn = await sequelize.transaction({
                    lock: Sequelize.Transaction.LOCK.UPDATE,
                    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
                });

                var creditUserObj = await Utility.getUserFiatWalletWithEmailOrPhone(body.email, body.phoneNumber, txn);
                if (!creditUserObj) {
                    txn.rollback();
                    return response.errorWithCode(res, "Receiver email/phone not found.", "RWNF0002");
                }
                var debitUserObj = await Utility.getUserFiatWallet(user.data.user_id, txn);

                if (!debitUserObj) {
                    txn.rollback();
                    return response.errorWithCode(res, "your wallet not found.", "SWNT0003");
                }

                var debitWalletObj = debitUserObj.UserWalletFiat;
                var creditWalletObj = creditUserObj.UserWalletFiat;

                if (creditUserObj.id == debitUserObj.id) {
                    txn.rollback();
                    return response.error(res, "Can not send to self. Error SWT0002");
                }

                if (body.amount > debitWalletObj.balanceKRW) {
                    txn.rollback();
                    return response.error(res, "Insufficient balance");
                }

                body.debitWallet = debitWalletObj.walletIdFiat;
                body.creditWallet = creditWalletObj.walletIdFiat;
                body.txnInitiater = user.data.user_id;


                var txnObj = await TransactionFiat.create(body, {
                    transaction: txn
                })

                await debitWalletObj.decrement('balanceKRW', {
                    by: body.amount,
                    transaction: txn
                });

                await creditWalletObj.increment('balanceKRW', {
                    by: body.amountCrypto,
                    transaction: txn
                });

                await debitWalletObj.reload({
                    transaction: txn
                })

                await txn.commit();

                console.log("sendFiat request created success. txn id =" + txnObj.fiatTxnId + "  TAK");

                return response.success(res, "Balance transferred successfully", {
                    txnObj: {
                        status: txnObj.status,
                        fiatTxnId: txnObj.fiatTxnId,
                    },
                    updatedBalance: debitWalletObj.balanceKRW
                });

            } catch (err) {
                console.error('Error::', err);
                if (txn) txn.rollback();
                return response.error(res, "Error in creating request. Error SWT0003");
            }

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const topUpFiat = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                amount: JOI.number().integer().min(1000).strict().required(),
                comments: JOI.string().max(200).allow(null).optional(),
            });

            body.txnType = 'WALLET_TOPUP';

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var txn = null;
            try {
                txn = await sequelize.transaction({
                    lock: Sequelize.Transaction.LOCK.UPDATE,
                    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
                });

                var userObj = await Utility.getUserFiatWallet(user.data.user_id, txn);

                if (!userObj) {
                    rollbackTxn(txn);
                    return response.error(res, "user wallet not found");
                }

                var adminUser = await Utility.getAdminFiatWallet(txn);
                if (!adminUser) {
                    rollbackTxn(txn);
                    return response.error(res, "admin wallet not found");
                }

                body.debitWallet = adminUser.UserWalletFiat.walletIdFiat;
                body.creditWallet = userObj.UserWalletFiat.walletIdFiat;
                body.txnInitiater = user.data.user_id;

                var txnObj = await TransactionFiat.create(body, {
                    transaction: txn
                })

                await txn.commit();

                console.log("topUpFiat request created success. txn id =" + txnObj.fiatTxnId + "  TAK");

                return response.success(res, "Top up request created successfully", {
                    txnObj: {
                        status: txnObj.status,
                        fiatTxnId: txnObj.fiatTxnId,
                    },
                });

            } catch (err) {
                console.error('Error::', err);
                if (txn) txn.rollback();
                return response.error(res, "Error in creating request. ETFR0001");
            }

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const rewardToKrw = async (req, res) => {

        try {

            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                amountToConvert: JOI.number().greater(0).strict().required().label("ITC to convert"),
                feeKrw: JOI.number().min(0).strict().required().label("Fee"),
                krwToReceive: JOI.number().greater(0).strict().required().label("Receivable Amount"),
                comments: JOI.string().max(200).allow(null).optional(),
            });


            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            //validate request. TAK
            var coinObj = await Coins.findOne({
                attributes: ["coinId", "rewardCnvrsnPrcnt", "krwPrice", "minRewardConvert"],
                where: {
                    coinName: "Intercash"
                }
            });
            if (!coinObj) {
                return response.error(res, "ITC coin not found. Error RTKE00013");
            }
            var minRewardConvert = coinObj.minRewardConvert;
            if (minRewardConvert == null || minRewardConvert < 0)
                return response.error(res, "Minimum allowed conversion amount not found. Error RTKE00014");
            if (body.amountToConvert < minRewardConvert)
                return response.error(res, "Minimum conversion amount is " + minRewardConvert + " . Error RTKE00014");
            var converstionPrcnt = coinObj.rewardCnvrsnPrcnt;
            if (converstionPrcnt == null || converstionPrcnt < 0)
                return response.error(res, "Fee not found. Error RTKE00015");
            var krwPrice = coinObj.krwPrice;
            if (krwPrice == null || krwPrice < 0)
                return response.error(res, "Fee not found. Error RTKE00016");
            var feeKrw = (body.amountToConvert * krwPrice * converstionPrcnt) / 100;
            if (feeKrw != body.feeKrw)
                return response.error(res, "Invalid Fee amount. Error RTKE00017");
            var krwToReceive = (body.amountToConvert * krwPrice) - feeKrw;
            if (krwToReceive != body.krwToReceive)
                return response.error(res, "Invalid Receivable Amount. Error RTKE00018");

            //end validate

            var txn = null;
            try {
                txn = await sequelize.transaction({
                    lock: Sequelize.Transaction.LOCK.UPDATE,
                    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
                });

                var userRewardWallet = await Utility.getUserRewardWalletITC(user.data.user_id, coinObj.coinId, txn);
                if (!userRewardWallet) {
                    rollbackTxn(txn);
                    return response.error(res, "user reward wallet not found");
                }

                if (userRewardWallet.balanceCrypto < body.amountToConvert) {
                    rollbackTxn(txn);
                    return response.error(res, "Reward wallet balance Insufficient.");
                }

                var adminRewardWallet = await Utility.getAdminRewardWalletITC(coinObj.coinId, txn);
                if (!adminRewardWallet) {
                    rollbackTxn(txn);
                    return response.error(res, "admin reward wallet not found.");
                }

                var cryptoTxn = {
                    amountCrypto: body.amountToConvert,
                    feeCrypto: (converstionPrcnt * body.amountToConvert) / 100,
                    debitWallet: userRewardWallet.walletIdCrypto,
                    creditWallet: adminRewardWallet.walletIdCrypto,
                    txnInitiater: user.data.user_id,
                    coinId: coinObj.coinId,
                    comments: "Reward balance conversion",
                    status: 'CONFIRMED',
                    txnType: 'REWARD_TO_KRW',
                    blockChainAddress: 'REWARD CONVERSION'
                }

                var cryptoTxnObj = await TransactionCryptoReward.create(cryptoTxn, {
                    transaction: txn
                })

                await userRewardWallet.decrement('balanceCrypto', {
                    by: body.amountToConvert,
                    transaction: txn
                });

                await adminRewardWallet.increment('balanceCrypto', {
                    by: body.amountToConvert,
                    transaction: txn
                });

                var userObj = await Utility.getUserFiatWallet(user.data.user_id, txn);

                if (!userObj) {
                    rollbackTxn(txn);
                    return response.error(res, "User fiat wallet not found.");
                }

                var adminUser = await Utility.getAdminFiatWallet(txn);
                if (!adminUser) {
                    rollbackTxn(txn);
                    return response.error(res, "admin wallet not found.");
                }

                if (adminUser.UserWalletFiat.balanceKRW < krwToReceive) {
                    rollbackTxn(txn);
                    return response.error(res, "Admin wallet low balance, please try after some time. Error RTKE00019.");
                }

                var fiatTxn = {
                    amount: krwToReceive,
                    debitWallet: adminUser.UserWalletFiat.walletIdFiat,
                    creditWallet: userObj.UserWalletFiat.walletIdFiat,
                    txnInitiater: adminUser.id,
                    coinId: coinObj.coinId,
                    comments: "Reward balance conversion",
                    status: 'CONFIRMED',
                    txnType: 'REWARD_TO_KRW',
                    refRewardCryptoTxnId: cryptoTxnObj.cryptoTxnId
                }

                var fiatTxnObj = await TransactionFiat.create(fiatTxn, {
                    transaction: txn
                });

                cryptoTxnObj.refRewardFiatTxnId = fiatTxnObj.fiatTxnId;

                await cryptoTxnObj.save({
                    transaction: txn,
                });

                await adminUser.UserWalletFiat.decrement('balanceKRW', {
                    by: krwToReceive,
                    transaction: txn
                });

                await userObj.UserWalletFiat.increment('balanceKRW', {
                    by: krwToReceive,
                    transaction: txn
                });

                await txn.commit();

                console.log("reward conversion successfull txn id fiat = " + fiatTxnObj.fiatTxnId + "  TAK");

                return response.successMsg(res, "Request completed successfully");

            } catch (err) {
                console.error('Error::', err);
                if (txn) txn.rollback();
                return response.error(res, err.message);
            }

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const krwToItc = async (req, res) => {

        try {

            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                amountToConvert: JOI.number().greater(0).strict().required().label("KRW to convert"),
                feeKrw: JOI.number().min(0).strict().required().label("Fee"),
                itcToReceive: JOI.number().greater(0).strict().required().label("Receivable ITC Amount"),
                comments: JOI.string().max(200).allow(null).optional(),
            });


            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            //validate request. TAK
            var coinObj = await Coins.findOne({
                attributes: ["coinId", "rewardCnvrsnPrcnt", "krwPrice", "minRewardConvert", "minKrwToConvert", "krwToCryptoFeePrcnt"],
                where: {
                    coinName: "Intercash"
                }
            });
            if (!coinObj) {
                return response.error(res, "ITC coin not found. Error RTKE00013");
            }
            var minKrwToConvert = coinObj.minKrwToConvert;
            if (minKrwToConvert == null || minKrwToConvert < 0)
                return response.error(res, "Minimum allowed conversion amount not found. Error KTC00014");
            if (body.amountToConvert < minKrwToConvert)
                return response.error(res, "Minimum conversion amount is " + minRewardConvert + " . Error RTKE00014");
            var krwToCryptoFeePrcnt = coinObj.krwToCryptoFeePrcnt;
            if (krwToCryptoFeePrcnt == null || krwToCryptoFeePrcnt < 0)
                return response.error(res, "Fee not found. Error KTCE00015");
            var feeKrw = (body.amountToConvert * krwToCryptoFeePrcnt) / 100;
            if (feeKrw != body.feeKrw)
                return response.error(res, "Invalid Fee amount. Error KTCE00017");

            var krwPrice = coinObj.krwPrice;
            if (krwPrice == null || krwPrice < 0)
                return response.error(res, "Fee not found. Error KTCE00016");

            var itcToReceive = (body.amountToConvert - feeKrw) / krwPrice;

            if (itcToReceive != body.itcToReceive)
                return response.error(res, "Invalid Receivable Amount. Error KTCE00018");

            //end validate

            var txn = null;
            try {
                txn = await sequelize.transaction({
                    lock: Sequelize.Transaction.LOCK.UPDATE,
                    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
                });

                var userObj = await Utility.getUserFiatWallet(user.data.user_id, txn);

                if (!userObj) {
                    rollbackTxn(txn);
                    return response.error(res, "User fiat wallet not found.");
                }

                if (userObj.UserWalletFiat.balanceKRW < body.amountToConvert) {
                    rollbackTxn(txn);
                    return response.error(res, "Wallet balance Insufficient.");
                }

                var adminUser = await Utility.getAdminFiatWallet(txn);
                if (!adminUser) {
                    rollbackTxn(txn);
                    return response.error(res, "admin wallet not found.");
                }

                var fiatTxn = {
                    amount: body.amountToConvert,
                    debitWallet: userObj.UserWalletFiat.walletIdFiat,
                    creditWallet: adminUser.UserWalletFiat.walletIdFiat,
                    fee: feeKrw,
                    txnInitiater: user.data.user_id,
                    comments: "Krw to crypto balance conversion",
                    status: 'CONFIRMED',
                    txnType: 'FIAT_TO_CRYPTO_EXCHANGE',
                }

                var fiatTxnObj = await TransactionFiat.create(fiatTxn, {
                    transaction: txn
                });

                await userObj.UserWalletFiat.decrement('balanceKRW', {
                    by: body.amountToConvert,
                    transaction: txn
                });

                await adminUser.UserWalletFiat.increment('balanceKRW', {
                    by: body.amountToConvert,
                    transaction: txn
                });

                //debit user crypto wallet from admin wallet.
                var userObjCrypto = await Utility.getUserCryptoWallet(user.data.user_id, coinObj.coinId, txn);
                if (!userObjCrypto) {
                    rollbackTxn(txn);
                    return response.error(res, "user crypto wallet not found.");
                }

                var adminUserCrypto = await Utility.getAdminCryptoWallet(coinObj.coinId, txn);
                if (!adminUserCrypto) {
                    rollbackTxn(txn);
                    return response.error(res, "admin crypto wallet not found.");
                }

                var debitWalletObjCrypto = adminUserCrypto.UserWalletCryptos[0];
                var creditWalletObjCrypto = userObjCrypto.UserWalletCryptos[0];

                if (itcToReceive > debitWalletObjCrypto.balanceCrypto) {
                    rollbackTxn(txn);
                    return response.error(res, "Insufficient admin balance");
                }

                var cryptoTxn = {
                    amountCrypto: itcToReceive,
                    debitWallet: debitWalletObjCrypto.walletIdCrypto,
                    creditWallet: creditWalletObjCrypto.walletIdCrypto,
                    txnInitiater: user.data.user_id,
                    coinId: coinObj.coinId,
                    comments: "Krw to crypto balance conversion",
                    status: 'CONFIRMED',
                    txnType: 'FIAT_TO_CRYPTO_EXCHANGE',
                    blockChainAddress: 'Fiat conversion',
                    krwToCryptoTxnId: fiatTxnObj.fiatTxnId
                }

                var cryptoTxnObj = await TransactionCrypto.create(cryptoTxn, {
                    transaction: txn
                });

                await debitWalletObjCrypto.decrement('balanceCrypto', {
                    by: itcToReceive,
                    transaction: txn
                });

                await creditWalletObjCrypto.increment('balanceCrypto', {
                    by: itcToReceive,
                    transaction: txn
                });

                //end

                await txn.commit();

                console.log("krw to crypto conversion successfull txn id fiat = " + fiatTxnObj.fiatTxnId + "  TAK");

                return response.successMsg(res, "Request completed successfully");

            } catch (err) {
                console.error('Error::', err);
                if (txn) txn.rollback();
                return response.error(res, err.message);
            }

        } catch (error) {
            console.error('Error::', error);
            if (txn) txn.rollback();
            return response.error(res, error.message);
        }

    };

    const transferItcFromAdminToUser = async (req, res) => {

        try {
            //const user = req.user;
            const body = req.body;
            var adminId = process.env.NODE_ENV == 'production' ? 90 : 81;

            const JoiResponse = JOI.validate(body, {
                email: JOI.string().email().allow(''),
                phoneNumber: JOI.string().trim().regex(/^\+(?:[0-9]●?){6,16}[0-9]$/).allow(''),
                amountCrypto: JOI.number().precision(8).strict().required(),
                coinId: JOI.number().integer().strict().required(),
                comments: JOI.string().max(200).allow(null).optional(),
                sendType: JOI.string().valid('USER', 'MERCHANT').required(),
            });

            body.txnType = 'TRANSFER';
            body.status = 'CONFIRMED';
            body.blockChainAddress = 'INTERNAL TRANSFER ADMIN';

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            if (!body.email && !body.phoneNumber) {
                return response.error(res, "Email or Phone is required. Error SWT0001");
            }

            var txn = null;

            try {
                txn = await sequelize.transaction({
                    lock: Sequelize.Transaction.LOCK.UPDATE,
                    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
                });

                var creditUserObj = (body.sendType == "USER") ? await Utility.getUserCryptoWalletWithEmailOrPhone(body.email, body.phoneNumber, body.coinId, txn) :
                    await Utility.getUserCryptoWalletWithEmailMerchant(body.email, body.coinId, txn);;

                if (!creditUserObj) {
                    txn.rollback();
                    return response.errorWithCode(res, "Receiver email not found.", "RWNFC0023");
                }
                var debitUserObj = await Utility.getUserCryptoWallet(adminId, body.coinId, txn);
                if (!debitUserObj) {
                    txn.rollback();
                    return response.errorWithCode(res, "Admin wallet not found.", "AWNTC0045");
                }

                if (Number(debitUserObj.role_id) !== 3) {
                    txn.rollback();
                    return response.errorWithCode(res, "Only Admin can send.", "OACSC0045");
                }

                var debitWalletObj = debitUserObj.UserWalletCryptos[0];
                var creditWalletObj = creditUserObj.UserWalletCryptos[0];

                if (creditUserObj.id == debitUserObj.id) {
                    txn.rollback();
                    return response.error(res, "Can not send to self. Error SWT0002");
                }

                if (body.amountCrypto > debitWalletObj.balanceCrypto) {
                    txn.rollback();
                    return response.error(res, "Admin Insufficient balance");
                }

                body.debitWallet = debitWalletObj.walletIdCrypto;
                body.creditWallet = creditWalletObj.walletIdCrypto;
                body.txnInitiater = adminId;

                var txnObj = await TransactionCrypto.create(body, {
                    transaction: txn
                })

                await debitWalletObj.decrement('balanceCrypto', {
                    by: body.amountCrypto,
                    transaction: txn
                });

                await creditWalletObj.increment('balanceCrypto', {
                    by: body.amountCrypto,
                    transaction: txn
                });

                await debitWalletObj.reload({
                    transaction: txn
                })
                await txn.commit();

                return response.success(res, "Balance transferred successfully", {
                    txnObj: {
                        coinId: txnObj.coinId,
                        status: txnObj.status,
                        cryptoTxnId: txnObj.cryptoTxnId,
                    },
                    updatedBalance: debitWalletObj.balanceCrypto,
                    sentTo: body.sendType
                });

            } catch (err) {
                console.error('Error::', err);
                if (txn) txn.rollback();
                return response.error(res, "Error in creating request. Error SWT0003");
            }

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const topUpITC = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                amountCrypto: JOI.number().precision(8).strict().required(),
                // coinId: JOI.number().integer().strict().required(),
                // blockChainAddress: JOI.string().min(3).max(255).allow('', null).optional(),
                // feeCrypto: JOI.number().precision(8).allow(null).optional(),
                blockChainAddress: JOI.string().min(3).max(255).required(),
                comments: JOI.string().max(200).allow('', null).optional(),
            });

            body.txnType = 'WALLET_TOPUP';

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var coinObj = await Coins.findOne({
                attributes: ["coinId", "rewardCnvrsnPrcnt", "krwPrice", "minRewardConvert"],
                where: {
                    coinName: "Intercash"
                }
            });

            if (!coinObj) {
                return response.error(res, "ITC coin not found. Error EIIT0013");
            }

            body.coinId = coinObj.coinId;

            var txn = null;
            try {
                txn = await sequelize.transaction({
                    lock: Sequelize.Transaction.LOCK.UPDATE,
                    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
                });
                var userObj = await Utility.getUserCryptoWallet(user.data.user_id, body.coinId, txn);

                if (!userObj) {
                    rollbackTxn(txn);
                    return response.error(res, "user wallet not found");
                }
                var adminUser = await Utility.getAdminCryptoWallet(body.coinId, txn);

                if (!adminUser) {
                    rollbackTxn(txn);
                    return response.error(res, "admin wallet not found");
                }

                body.debitWallet = adminUser.UserWalletCryptos[0].walletIdCrypto;
                body.creditWallet = userObj.UserWalletCryptos[0].walletIdCrypto;
                body.txnInitiater = user.data.user_id;
                //body.blockChainAddress = ''; // when approving topup, this may be updated with actual one. TAK

                var txnObj = await TransactionCrypto.create(body, {
                    transaction: txn
                })

                await txn.commit();

                console.log("topUpITC request created success. txn id =" + txnObj.cryptoTxnId + "  TAK");

                return response.successOther(res, "ITC Top up request created successfully", txnObj.cryptoTxnId);

            } catch (err) {
                console.error('Error::', err);
                if (txn) txn.rollback();
                return response.error(res, "Error in creating request. CWR0EIIT0019");
            }

        } catch (error) {
            console.log('Error::', error);
            return response.error(res, error.message);
        }

    };

    return {
        getITCaddress,
        getWallets,
        topUpCrypto,
        sendCrypto,
        sendFiat,
        topUpFiat,
        rewardToKrw,
        krwToItc,
        transferItcFromAdminToUser,
        topUpITC
    };
};

module.exports = WalletController;

async function rollbackTxn(txn) {
    if (txn)
        txn.rollback();
}