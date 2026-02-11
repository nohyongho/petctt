/** Model */
const User = require('../models/User');

const UserSeenAds = require('../models/ARM_UserSeenAds');
const Categories = require('../models/Categories');
const Ads = require('../models/ARM_Ads');
const RewardWalletCrypto = require('../models/ARM_RewardWalletCrypto');
const SeenAdsLocation = require('../models/ARM_SeenAdsLocation');

const Coins = require('../models/Coins');
const Role = require('../models/Role');
const GeneralConfig = require('../models/GeneralConfig');
const UserWalletCrypto = require('../models/UserWalletCrypto');
const TransactionCrypto = require('../models/TransactionCrypto');


/** Helpers */
const response = require('../helper/response');
const JOI = require('joi');
const sequelize = require('../config/database');
const Sequelize = require('sequelize');
const Utility = require('../helper/Utility');

const keys = require('../config/keys');
const commonConstants = require('../constants/commonConstants').commonConstants;
const aws = require('aws-sdk');

aws.config.update((process.env.NODE_ENV == 'production') ? keys.awsConfigsProd : keys.awsConfigs);

const s3 = new aws.S3();


const RewardsController = () => {

    const getAds = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {});

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var allAds = await Ads.findAll({
                attributes: {
                    exclude: ["repeatCount", "perViewPrice", "cryptoTxnId", "budgetITC", "remainingBudget",
                        "status", "createdAt", "updatedAt", "catId", "advertiserId"
                    ]
                },
                where: Sequelize.literal(" ad_type in ('IMAGE','VIDEO') AND soft_delete = 0 AND " +
                    "status = 'ACTIVE' AND is_paused = 0 AND (`Ads`.`repeat_count` > `UserSeenAds`.`count` OR `UserSeenAds`.`count` IS NULL)"),
                include: [{
                    attributes: [],
                    model: UserSeenAds,
                    required: false,
                    where: {
                        userId: user.data.user_id,
                    },
                }, {
                    model: Categories,
                    attributes: ["id", "title", "title_en"],
                }],
            });

            return response.success(res, (allAds && allAds.length == 0) ? "No ads available" : "", allAds);

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const seenAd = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                adId: JOI.number().integer().min(1).strict().required(),
                lat: JOI.number().precision(8).required().strict().label("Latitude"),
                lng: JOI.number().precision(8).required().strict().label("Longitude"),
                countryIso: JOI.string().allow('').max(5).strict().optional(),
            });

            body.userId = user.data.user_id;

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var txn = null;
            txn = await sequelize.transaction({
                lock: Sequelize.Transaction.LOCK.UPDATE,
                isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
            });

            var ad = await Ads.findOne({
                attributes: ["adId", "status", "repeatCount", "remainingBudget", "perViewPrice", "totalSeenCount", "adType", "softDelete", "isPaused"],
                where: {
                    adId: body.adId
                },
                include: {
                    required: false,
                    attributes: ["id", "count"],
                    model: UserSeenAds,
                    where: {
                        userId: body.userId
                    }
                },
                transaction: txn,
            });

            if (!ad) {
                txn.rollback();
                return response.error(res, "Ad not found");
            } else if (ad.status != 'ACTIVE') {
                txn.rollback();
                return response.error(res, "Ad not actvie");
            } else if (ad.isPaused) {
                txn.rollback();
                return response.error(res, "Ad is paused");
            } else if (ad.sodeleteAdftDelete) {
                txn.rollback();
                return response.error(res, "Ad not available anymore");
            } else if (ad.adType == 'QRAD') {
                txn.rollback();
                return response.error(res, "Invalid Ad. It is a QR ad");
            } else if (ad.UserSeenAds && ad.UserSeenAds.length > 0) {
                if (ad.UserSeenAds[0].count >= ad.repeatCount) {
                    txn.rollback();
                    return response.error(res, "Ad view limit over");
                } else if (ad.remainingBudget < ad.perViewPrice) {
                    txn.rollback();
                    return response.errorWithCode(res, "Ad budget over", "ABO0013");
                }
            }
            var userSeenAd = null;
            if (!ad.UserSeenAds || ad.UserSeenAds.length == 0) {
                userSeenAd = await UserSeenAds.create({
                    adId: ad.adId,
                    userId: body.userId,
                    count: 1
                }, {
                    transaction: txn
                });
            } else {
                userSeenAd = ad.UserSeenAds[0];
                await userSeenAd.increment('count', {
                    transaction: txn
                });
            }

            ad.totalSeenCount = ad.totalSeenCount + 1;
            ad.remainingBudget = ad.remainingBudget - ad.perViewPrice;

            await ad.save({
                transaction: txn,
            });

            var coinObj = await Coins.findOne({
                attributes: ["coinId"],
                where: {
                    coinName: "Intercash"
                }
            });

            if (!coinObj) {
                txn.rollback();
                return response.errorWithCode(res, "ITC coin not found", "ICNF0035");
            }

            var userRewardWallet = await Utility.getUserRewardWalletITC(body.userId, coinObj.coinId, txn);
            if (!userRewardWallet) {
                userRewardWallet = await RewardWalletCrypto.create({
                    userId: body.userId,
                    coinId: coinObj.coinId
                }, {
                    transaction: txn
                })
            }

            var adminRewardWallet = await Utility.getAdminRewardWalletITC(coinObj.coinId, txn);
            if (!adminRewardWallet) {
                var adminUser = await User.findOne({
                    attributes: ["id"],
                    include: {
                        required: true,
                        model: Role,
                        where: {
                            name: "admin"
                        }
                    },
                });
                if (!adminUser) {
                    txn.rollback();
                    return response.errorWithCode(res, "Admin user not found", "AUNF0038");
                }
                adminRewardWallet = await Utility.getUserRewardWalletITC(adminUser.id, coinObj.coinId, txn);
                if (!adminRewardWallet) {
                    adminRewardWallet = await RewardWalletCrypto.create({
                        userId: adminUser.id,
                        coinId: coinObj.coinId
                    }, {
                        transaction: txn
                    })
                }
            }

            var creditAmount = ad.perViewPrice / 2;

            await userRewardWallet.increment('balanceCrypto', {
                by: creditAmount,
                transaction: txn
            });

            await adminRewardWallet.increment('balanceCrypto', {
                by: creditAmount,
                transaction: txn
            });

            await SeenAdsLocation.create({
                userSeenAdsId: userSeenAd.id,
                lat: body.lat,
                lng: body.lng,
                countryIso: body.countryIso
            }, {
                transaction: txn
            })

            txn.commit();

            return response.successOther(res, "Success", creditAmount);

        } catch (error) {
            if (txn)
                txn.rollback();
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const seeQrAd = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                adId: JOI.number().integer().min(1).strict().required(),
                lat: JOI.number().precision(8).required().strict().label("Latitude"),
                lng: JOI.number().precision(8).required().strict().label("Longitude"),
                countryIso: JOI.string().allow('').max(5).strict().optional(),
            });

            body.userId = user.data.user_id;

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var txn = null;
            txn = await sequelize.transaction({
                lock: Sequelize.Transaction.LOCK.UPDATE,
                isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
            });

            var ad = await Ads.findOne({
                attributes: ["adId", "status", "repeatCount", "remainingBudget", "perViewPrice", "totalSeenCount", "adType", "softDelete", "isPaused"],
                where: {
                    adId: body.adId
                },
                include: {
                    required: false,
                    attributes: ["id", "count"],
                    model: UserSeenAds,
                    where: {
                        userId: body.userId
                    }
                },
                transaction: txn,
            });

            if (!ad) {
                txn.rollback();
                return response.error(res, "Ad not found");
            } else if (ad.adType != 'QRAD') {
                txn.rollback();
                return response.error(res, "Invalid ad, not a QR ad");
            } else if (ad.softDelete) {
                txn.rollback();
                return response.error(res, "QR ad not available anymore");
            } else if (ad.status != 'ACTIVE') {
                txn.rollback();
                return response.error(res, "Ad not actvie");
            } else if (ad.isPaused) {
                txn.rollback();
                return response.error(res, "Ad is paused");
            } else if (ad.UserSeenAds && ad.UserSeenAds.length > 0) {
                if (ad.UserSeenAds[0].count >= ad.repeatCount) {
                    txn.rollback();
                    return response.error(res, "Ad view limit over");
                } else if (ad.remainingBudget < ad.perViewPrice) {
                    txn.rollback();
                    return response.errorWithCode(res, "Ad budget over", "ABO0013");
                }
            }
            var userSeenAd = null;
            if (!ad.UserSeenAds || ad.UserSeenAds.length == 0) {
                userSeenAd = await UserSeenAds.create({
                    adId: ad.adId,
                    userId: body.userId,
                    count: 1
                }, {
                    transaction: txn
                });
            } else {
                userSeenAd = ad.UserSeenAds[0];
                await userSeenAd.increment('count', {
                    transaction: txn
                });
            }

            ad.totalSeenCount = ad.totalSeenCount + 1;
            ad.remainingBudget = ad.remainingBudget - ad.perViewPrice;

            await ad.save({
                transaction: txn,
            });

            var coinObj = await Coins.findOne({
                attributes: ["coinId"],
                where: {
                    coinName: "Intercash"
                }
            });

            if (!coinObj) {
                txn.rollback();
                return response.errorWithCode(res, "ITC coin not found", "ICNF0035");
            }

            var userRewardWallet = await Utility.getUserRewardWalletITC(body.userId, coinObj.coinId, txn);
            if (!userRewardWallet) {
                userRewardWallet = await RewardWalletCrypto.create({
                    userId: body.userId,
                    coinId: coinObj.coinId
                }, {
                    transaction: txn
                })
            }

            var adminRewardWallet = await Utility.getAdminRewardWalletITC(coinObj.coinId, txn);
            if (!adminRewardWallet) {
                var adminUser = await User.findOne({
                    attributes: ["id"],
                    include: {
                        required: true,
                        model: Role,
                        where: {
                            name: "admin"
                        }
                    },
                });
                if (!adminUser) {
                    txn.rollback();
                    return response.errorWithCode(res, "Admin user not found", "AUNF0038");
                }
                adminRewardWallet = await Utility.getUserRewardWalletITC(adminUser.id, coinObj.coinId, txn);
                if (!adminRewardWallet) {
                    adminRewardWallet = await RewardWalletCrypto.create({
                        userId: adminUser.id,
                        coinId: coinObj.coinId
                    }, {
                        transaction: txn
                    })
                }
            }

            var creditAmount = ad.perViewPrice / 2;

            await userRewardWallet.increment('balanceCrypto', {
                by: creditAmount,
                transaction: txn
            });

            await adminRewardWallet.increment('balanceCrypto', {
                by: creditAmount,
                transaction: txn
            });

            await SeenAdsLocation.create({
                userSeenAdsId: userSeenAd.id,
                lat: body.lat,
                lng: body.lng,
                countryIso: body.countryIso
            }, {
                transaction: txn
            })

            txn.commit();

            return response.successOther(res, "Success", creditAmount);

        } catch (error) {
            if (txn)
                txn.rollback();
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const getMyAds = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {});

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var allAds = await Ads.findAll({
                where: {
                    advertiserId: user.data.user_id,
                    softDelete: false
                },
                include: {
                    required: false,
                    model: TransactionCrypto,
                    attributes: ["cryptoTxnId", "amountCrypto", "status", "comments", "createdAt"]
                }
            });

            return response.success(res, "", allAds);

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const changeAdStatus = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                adId: JOI.number().integer().min(1).strict().required(),
                status: JOI.string().valid('ACTIVE', 'INACTIVE').required(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var myAd = await Ads.findOne({
                attributes: ["status", "adId"],
                where: {
                    advertiserId: user.data.user_id,
                    adId: body.adId
                },
            });

            if (!myAd)
                return response.error(res, "Ad not found");

            if (myAd.status == body.status)
                return response.error(res, "Ad is already " + body.status.toLowerCase());

            myAd.status = body.status;
            myAd.save();

            return response.successMsg(res, "Ad status changed successfully. Ad is now " + body.status.toLowerCase());

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const getAdById = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                adId: JOI.number().integer().min(1).strict().required(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var myAd = await Ads.findOne({
                where: {
                    // advertiserId: user.data.user_id,
                    adId: body.adId
                },
                include: {
                    required: false,
                    model: TransactionCrypto,
                    attributes: ["cryptoTxnId", "amountCrypto", "status", "comments", "createdAt"]
                }
            });

            if (!myAd)
                return response.error(res, "Ad not found");

            return response.success(res, "Ad fetched", myAd);

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const createAd = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                budgetITC: JOI.number().greater(0).label("Budget").required(),
                repeatCount: JOI.number().integer().min(1).max(100).label("Repeat Count").required(),
                title: JOI.string().min(1).max(100).trim().required(),
                detail: JOI.string().min(1).max(200).allow('').trim().optional(),
                link: JOI.string().uri().trim().allow('').optional(),
                adType: JOI.string().valid('IMAGE', 'VIDEO', 'QRAD').required(),
                catId: JOI.number().integer().min(1).optional(),
                isExternalLink: JOI.boolean().required().label("Is external link"),
                externalLink: JOI.string().uri().trim().allow('').optional(),
            });

            body.userId = user.data.user_id;

            if (JoiResponse.error) {
                deleteAdFromS3Bucket(req);
                return response.error(res, JoiResponse.error.details[0].message);
            }
            //validating req
            if (body.isExternalLink == "true" && !body.externalLink) {
                deleteAdFromS3Bucket(req);
                return response.error(res, "Please provide external link to file");
            } else if (body.isExternalLink == "false" && body.externalLink) {
                deleteAdFromS3Bucket(req);
                return response.error(res, "Please provide either external link or upload file");
            }
            //end validation

            var userItcWallet = await UserWalletCrypto.findOne({
                attributes: ["balanceCrypto"],
                where: {
                    userId: body.userId,
                },
                include: {
                    model: Coins,
                    required: true,
                    attributes: [],
                    where: {
                        coinName: "Intercash"
                    }
                }
            });
            if (!userItcWallet) {
                deleteAdFromS3Bucket(req);
                return response.error(res, "ITC wallet not found, please log out and login again");
            } else if (Number(userItcWallet.balanceCrypto) < Number(body.budgetITC)) {
                deleteAdFromS3Bucket(req);
                return response.error(res, "Insufficient ITC balance");
            }


            var adTxn = {};
            adTxn.advertiserId = body.userId;
            adTxn.budgetITC = body.budgetITC;
            adTxn.remainingBudget = body.budgetITC;
            adTxn.repeatCount = body.repeatCount;
            adTxn.title = body.title;
            adTxn.detail = body.detail;
            adTxn.link = body.link;

            adTxn.adType = body.adType;
            adTxn.status = 'ACTIVE';
            adTxn.isExternalLink = body.isExternalLink;
            if (body.catId)
                adTxn.catId = body.catId;

            if (body.isExternalLink == "false") {
                var filesLength = Object.keys(req.files).length;
                if (filesLength === 0) {
                    deleteAdFromS3Bucket(req);
                    return response.error(res, "Please upload ad file/s, error creating ad. ECA00453");
                } else if (body.adType == "IMAGE" && req.files.typeImage)
                    adTxn.imgUrl = req.files.typeImage[0].key;
                else if (body.adType == "VIDEO" && req.files.typeVideo)
                    adTxn.videoUrl = req.files.typeVideo[0].key;
                else if (body.adType == "QRAD" && req.files.typeQrAd)
                    adTxn.videoUrl = req.files.typeQrAd[0].key;
                else {
                    deleteAdFromS3Bucket(req);
                    return response.error(res, "Please upload ad file/s, error creating ad. ECA00455");
                }

            } else if (body.isExternalLink == "true") {
                if (body.adType == "IMAGE")
                    adTxn.imgUrl = body.externalLink;
                else if (body.adType == "VIDEO")
                    adTxn.videoUrl = body.externalLink;
                else if (body.adType == "QRAD")
                    adTxn.videoUrl = body.externalLink;
            }

            var configName;
            if (body.adType == "IMAGE")
                configName = "IMAGE"; //"ad_image_perview";
            else if (body.adType == "VIDEO")
                configName = "VIDEO" //"ad_video_perview";
            else if (body.adType == "QRAD")
                configName = "QRAD" // "ad_qr_perview";
            else {
                deleteAdFromS3Bucket(req);
                return response.error(res, "Ad type not found"); //although not required as already handled in JOI. TAK
            }

            var generalConfig = await GeneralConfig.findOne({
                attributes: ["configValue"],
                where: {
                    configName: configName
                }
            });

            if (!generalConfig || !generalConfig.configValue) {
                deleteAdFromS3Bucket(req);
                return response.error(res, "Ad perview price not found, error creating ad");
            }

            //create txn. TAK
            var txn = null;
            txn = await sequelize.transaction({
                lock: Sequelize.Transaction.LOCK.UPDATE,
                isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
            });

            var coinObj = await Coins.findOne({
                attributes: ["coinId"],
                where: {
                    coinName: "Intercash"
                }
            });

            var cryptoTxnId = await Utility.makeUserToAdminCryptoTxn(body.userId, body.budgetITC, coinObj.coinId, txn);
            //end

            adTxn.perViewPrice = generalConfig.configValue;
            adTxn.cryptoTxnId = cryptoTxnId;
            var ad = await Ads.create(adTxn, {
                transaction: txn
            });
            await txn.commit();
            if (!ad) {
                rollbackTxn(txn);
                deleteAdFromS3Bucket(req);
                return response.error(res, "Error in creating ad, please try later. Error ECA0045");
            }
            return response.successOther(res, "Success", ad.adId);

        } catch (error) {
            console.error('Error::', error);
            rollbackTxn(txn);
            deleteAdFromS3Bucket(req);
            return response.error(res, error.message);
        }
    }

    const deleteAd = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                adId: JOI.number().integer().min(1).strict().required(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var myAd = await Ads.findOne({
                attributes: ["softDelete", "adId"],
                where: {
                    advertiserId: user.data.user_id,
                    adId: body.adId
                },
            });

            if (!myAd)
                return response.error(res, "Ad not found");

            if (myAd.softDelete)
                return response.error(res, "Ad is already deleted");

            myAd.softDelete = true;
            myAd.save();

            return response.successMsg(res, "Ad deleted successfully.");

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const pauseAd = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                adId: JOI.number().integer().min(1).strict().required(),
                pauseAd: JOI.boolean().strict().required()
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var myAd = await Ads.findOne({
                attributes: ["softDelete", "adId", "isPaused"],
                where: {
                    advertiserId: user.data.user_id,
                    adId: body.adId
                },
            });

            if (!myAd)
                return response.error(res, "Ad not found");

            // if (myAd.softDelete)
            //     return response.error(res, "Ad is already deleted");

            if (myAd.isPaused && body.pauseAd)
                return response.error(res, "Ad is already paused");
            else if (!myAd.isPaused && !body.pauseAd)
                return response.error(res, "Ad is already active");

            myAd.isPaused = body.pauseAd;
            myAd.save();

            return response.successMsg(res, "Ad " + ((body.pauseAd) ? "paused" : "activated") + " successfully.");

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    const editAd = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                adId: JOI.number().integer().min(1).strict().required(),
                repeatCount: JOI.number().integer().min(1).max(100).label("Repeat Count").optional(),
                title: JOI.string().min(1).max(100).trim().optional(),
                detail: JOI.string().min(1).max(200).allow('').trim().optional(),
                link: JOI.string().uri().trim().allow('').optional(),
                catId: JOI.number().integer().min(1).optional(),
            });

            body.userId = user.data.user_id;

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var myAd = await Ads.findOne({
                where: {
                    advertiserId: user.data.user_id,
                    adId: body.adId
                },
            });

            if (!myAd)
                return response.error(res, "Ad not found");

            if (myAd.softDelete)
                return response.error(res, "Ad is in deleted state, can't be edited");

            if (body.repeatCount)
                myAd.repeatCount = body.repeatCount;
            if (body.title)
                myAd.title = body.title;
            if (body.detail)
                myAd.detail = body.detail;
            if (body.link)
                myAd.link = body.link;
            if (body.catId)
                myAd.catId = body.catId;

            myAd.save();
            return response.successMsg(res, "Ad updated successfully");

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }
    }

    const adsPerViewAmount = async (req, res) => {

        try {
            var configNameList = ['IMAGE', 'VIDEO', 'QRAD', 'MARKER'];
            var adsPerViewAmount = await GeneralConfig.findAll({
                attributes: [
                    ["config_name", "type"],
                    ["config_value", "value"]
                ],
                where: {
                    configName: configNameList
                }
            });

            if (!adsPerViewAmount)
                return response.error(res, "Ads per view click amount not found");

            return response.success(res, (adsPerViewAmount.length == 0) ? "Empty list" : "Success", adsPerViewAmount);

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    return {
        getAds,
        seenAd,
        seeQrAd,
        getMyAds,
        changeAdStatus,
        getAdById,
        createAd,
        deleteAd,
        pauseAd,
        editAd,
        adsPerViewAmount
    };
};

module.exports = RewardsController;

/* 
/ deleting files from s3 bucket in case error occured
/ in calling createAd api . TAK
/
*/
async function deleteAdFromS3Bucket(req) {
    if (!req.files)
        return
    if (req.files.typeImage) {
        s3.deleteObject({
            Bucket: commonConstants.S3_BUCKET_NAME,
            Key: req.files.typeImage[0].key
        }, function (err, data) {})
    }

    if (req.files.typeVideo) {
        s3.deleteObject({
            Bucket: commonConstants.S3_BUCKET_NAME,
            Key: req.files.typeVideo[0].key
        }, function (err, data) {})
    }
    if (req.files.typeQrAd) {
        s3.deleteObject({
            Bucket: commonConstants.S3_BUCKET_NAME,
            Key: req.files.typeQrAd[0].key
        }, function (err, data) {})
    }
}

async function rollbackTxn(txn) {
    if (txn)
        txn.rollback();
}