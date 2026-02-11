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

/** Keys */
const keys = require('../config/keys');

/**Services  */
const uploadImage = require('../services/imageUpload.service');

/** Helpers */
const response = require('../helper/response');
const responseMessages = require('../helper/responseMessages');
const constant = require('../constants/ConstantMessages');
const validate = require('../helper/validators/WalletValidator');
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




const WalletController = () => {

    const getWallets = async(req, res) => {

        try {


            const { user } = req;
            const validationResponse = validate.getwallet(req.body);

            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }

            const foundUser = await User.findOne({
                where: {
                    id: user.data.user_id,
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


    return {
        getWallets,



    };
};

module.exports = WalletController;