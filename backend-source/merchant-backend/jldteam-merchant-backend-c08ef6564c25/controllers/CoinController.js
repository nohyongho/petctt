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




const CoinController = () => {

    const coinslist = async(req, res) => {

        const body = req.body;

        try {
            const { user } = req;
            var coinsData = await Coin.findAll({

                where: [{ soft_delete: false }],

            });

            return response.successDT(res, constant.SUCCESS, coinsData, coinsData.length);

        } catch (error) {

            return response.error(res, error.message);
        }

    };



    return {
        coinslist,


    };
};

module.exports = CoinController;