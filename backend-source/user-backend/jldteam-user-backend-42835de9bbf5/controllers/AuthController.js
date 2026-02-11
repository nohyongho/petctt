/** Model */
const User = require('../models/User');
const UserDetail = require('../models/UserDetail');
const UserVerification = require('../models/UserVerification');
const Outlet = require('../models/Outlet');
const Brand = require('../models/Brand');
const CountryList = require('../models/CountryList');
const StateList = require('../models/StateList');
const CityList = require('../models/CityList');
const Role = require('../models/Role');
const Coins = require('../models/Coins');
const UserWalletFiat = require('../models/UserWalletFiat');
const UserWalletCrypto = require('../models/UserWalletCrypto');
const RewardWalletCrypto = require('../models/ARM_RewardWalletCrypto');

const JOI = require('joi');


/** Keys */
const keys = require('../config/keys');

/** Helpers */
const response = require('../helper/response');
const responseMessages = require('../helper/responseMessages');
// const responseMessages = require('../helper/koreanMessages');
const validate = require('../helper/validators/AuthController/validate');
const mailer = require('../services/mailer.service');
const bcryptService = require('../services/bcrypt.service');
const authService = require('../services/auth.service');
const commonConstants = require('../constants/commonConstants').commonConstants;


/** Library */
const Sequelize = require('sequelize');
var moment = require('moment');
const Op = Sequelize.Op;
const crypto = require('crypto');
const path = require('path');
const pug = require('pug');
const fs = require('fs');
const request = require('request');
const AWS = require('aws-sdk');
AWS.config.update((process.env.NODE_ENV == 'production') ? keys.awsConfigsProd : keys.awsConfigs);

const sequelize = require('../config/database');

const aws = require('aws-sdk');
aws.config.update((process.env.NODE_ENV == 'production') ? keys.awsConfigsProd : keys.awsConfigs);
const s3 = new aws.S3();



const AuthController = () => {

    const register = async (req, res) => {
        try {
            const body = req.body;
            const validationResponse = validate.registration_body(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }

            const {
                email,
                country_id
            } = req.body;

            delete req.body.country_id;
            delete req.body.confirm_password;

            const foundUser = await User.findOne({
                where: {
                    [Op.or]: [{
                        email: email
                    }, {
                        contact_no: req.body.contact_no
                    }]
                }
            });

            if (foundUser) {
                let errKey = 'alreadyExistEmail';
                if (req.body.contact_no == foundUser.contact_no)
                    errKey = 'alreadyExistPhone';
                return response.error(res, responseMessages.getter(req, 'newUser', errKey));
            }

            const foundRole = await Role.findOne({
                where: {
                    name: 'user'
                }
            });

            if (!foundRole) {
                return response.error(res, 'Role is not defined');
            }

            //creating user with txn. TAK
            var txn = null;
            try {
                const currentTime = new Date(Date.now());

                txn = await sequelize.transaction({
                    lock: Sequelize.Transaction.LOCK.SHARE,
                    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
                });
                body.user_status = 'notverified';
                body.role_id = foundRole.id;
                body.user_status_changed_at = currentTime;

                var newUser = await User.create(body, {
                    transaction: txn
                });

                await UserDetail.create({
                    country_id,
                    user_id: newUser.id
                }, {
                    transaction: txn
                });

                //create fiat wallet
                await UserWalletFiat.create({
                    userId: newUser.id,
                }, {
                    transaction: txn
                });
                //end create fiat wallet. TAK

                //crypto wallet create. TAK
                await createCryptoWallets(newUser, txn)
                //end crypto wallet create. TAK

                //reward crypto wallet create. TAK
                await createRewardWalletCrypto(newUser, txn)
                //end reward crypto wallet create. TAK

                var stringToHashForVerifyEmail = email + (Math.floor((Math.random() * 1000000) + 1));

                const secret = keys.verificationLink.key;
                const hash = crypto.createHmac('sha256', secret)
                    .update(stringToHashForVerifyEmail)
                    .digest('hex');

                await UserVerification.create({
                    verification_code: hash,
                    verification_type: 'email',
                    user_id: newUser.id,
                    status: 'active'
                }, {
                    transaction: txn
                });

                await txn.commit();

                mailer.sendVerificationEmail(email, hash, newUser.full_name);
                return response.success(res, responseMessages.getter(req, 'newUser', 'success'));

            } catch (error) {
                console.log('Error::', error);
                if (txn) txn.rollback();
                return response.error(res, responseMessages.getter(req, 'newUser', 'error'));
            }
            //end

        } catch (error) {
            console.log('Error::::', error)
            return response.error(res, error.message);
        }


    };
    const login = async (req, res) => {
        const {
            email,
            password
        } = req.body;
        const body = req.body;

        const validationResponse = validate.login_body(body);
        if (!validationResponse.status) {
            return response.bodyNotFound(res, validationResponse.msg);
        }
        const foundUser = await User.findOne({
            where: {
                email
            },
            include: [{
                    model: UserDetail,
                    attributes: ['postal_code', 'address', 'image'],
                    include: [{
                            model: CountryList,
                            attributes: ['id', 'country_name']
                        },
                        {
                            model: StateList,
                            attributes: ['state_name']
                        },
                        {
                            model: CityList,
                            attributes: ['city_name']
                        }
                    ]
                },
                {
                    model: Role,
                    where: {
                        name: 'user'
                    }
                },
                {
                    required: false,
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "userId"]
                    },
                    model: UserWalletFiat
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
                        where: {
                            coinName: "Intercash"
                        }
                    }
                },

            ]
        });

        if (!foundUser) {
            return response.error(res, responseMessages.getter(req, 'user', 'notRegistered'));
        }

        if (!foundUser.is_email_verified) {
            return response.error(res, responseMessages.getter(req, 'login', 'email_not_verified'));
        }

        if (foundUser.user_status !== 'active') {
            return response.error(res, responseMessages.getter(req, 'login', 'user_blocked'));
        }

        if (!bcryptService.comparePassword(password, foundUser.password)) {
            return response.error(res, responseMessages.getter(req, 'login', 'invalid_credentials'));
        }

        const token = authService.issue_token({
            user_id: foundUser.id,
            email: email
        });
        const refreshToken = authService.issue_refresh_token({
            user_id: foundUser.id,
            email: email
        });
        const login_time = new Date(Date.now());

        await foundUser.update({
            login_time,
            login_status: true
        });

        //check if fiat wallet present
        var reload = false;
        if (!foundUser.UserWalletFiat) {
            reload = true;
            await UserWalletFiat.create({
                userId: foundUser.id
            });
        }
        //

        //check if crypto wallets present, if not create. TAK
        const allCoins = await Coins.findAll({
            attributes: ['coinId'],
            where: {
                softDelete: false,
            }
        });

        if (foundUser.UserWalletCryptos && foundUser.UserWalletCryptos.length == 0 && allCoins.length != 0) {
            reload = true;
            await createCryptoWallets(foundUser, null);
        } else if (foundUser.UserWalletCryptos && foundUser.UserWalletCryptos.length != allCoins.length && foundUser.UserWalletCryptos.length != 0) {
            reload = true;
            var presentUserCryptoWalletsIds = [];
            foundUser.UserWalletCryptos.forEach(cryptoWallet => {
                presentUserCryptoWalletsIds.push(cryptoWallet.Coin.coinId);
            });

            var newCryptoWalletsToCreate = [];
            allCoins.forEach(coin => {
                if (presentUserCryptoWalletsIds.includes(coin.coinId)) {

                } else
                    newCryptoWalletsToCreate.push({
                        userId: foundUser.id,
                        coinId: coin.coinId
                    });
            });
            await UserWalletCrypto.bulkCreate(newCryptoWalletsToCreate);
        }
        //end

        //check if reward wallet created, if not create it.TAK
        if (foundUser.RewardWalletCryptos && foundUser.RewardWalletCryptos.length == 0) {
            reload = true;
            var coinObj = await Coins.findOne({
                attributes: ["coinId"],
                where: {
                    coinName: "Intercash"
                }
            });
            if (coinObj) {
                await RewardWalletCrypto.create({
                    userId: foundUser.id,
                    coinId: coinObj.coinId
                })
            }
        }
        //end

        if (reload)
            await foundUser.reload();

        /**making json user record for mobile app */
        let userDetail = {
            full_name: foundUser.full_name,
            contact_no: foundUser.contact_no,
            age: foundUser.age,
            gender: foundUser.gender,
            login_time: foundUser.login_time,
            createdAt: foundUser.createdAt,
            postal_code: foundUser.UserDetails[0].postal_code,
            image: foundUser.UserDetails[0].image,
            address: foundUser.UserDetails[0].address,
            country: foundUser.UserDetails[0].CountryList ? foundUser.UserDetails[0].CountryList.country_name : '',
            country_id: foundUser.UserDetails[0].CountryList ? foundUser.UserDetails[0].CountryList.id : 0,
            /**0 means country_id not exist */
            state: foundUser.UserDetails[0].StateList ? foundUser.UserDetails[0].StateList.state_name : '',
            city: foundUser.UserDetails[0].CityList ? foundUser.UserDetails[0].CityList.city_name : '',
            userWalletFiat: foundUser.UserWalletFiat,
            userWalletCrypto: foundUser.UserWalletCryptos,
            userRewardWalletCrypto: foundUser.RewardWalletCryptos
        }
        return response.success(res, responseMessages.getter(req, 'login', 'success'), {
            token,
            refreshToken,
            user: userDetail,
        });

    };
    const outletUserLogin = async (req, res) => {
        const {
            email,
            password
        } = req.body;
        const body = req.body;

        const validationResponse = validate.login_body(body);
        if (!validationResponse.status) {
            return response.bodyNotFound(res, validationResponse.msg);
        }

        const foundUser = await User.findOne({
            where: {
                email
            },
            include: [{
                    model: UserDetail,
                    attributes: ['postal_code', 'address', 'image'],
                    include: [{
                            model: CountryList,
                            attributes: ['id', 'country_name']
                        },
                        {
                            model: StateList,
                            attributes: ['state_name']
                        },
                        {
                            model: CityList,
                            attributes: ['city_name']
                        }
                    ]
                },
                {
                    model: Role,
                    where: {
                        name: 'outletUser'
                    }
                }, {
                    model: Outlet,
                    include: {
                        model: Brand
                    }
                }
            ]
        });

        if (!foundUser) {
            return response.error(res, responseMessages.getter(req, 'user', 'notRegistered'));
        }

        if (!foundUser.is_email_verified) {
            return response.unauthorized(res, responseMessages.getter(req, 'login', 'email_not_verified'));
        }

        if (foundUser.user_status !== 'active') {
            return response.unauthorized(res, responseMessages.getter(req, 'login', 'user_blocked'));
        }

        if (!bcryptService.comparePassword(password, foundUser.password)) {
            return response.unauthorized(res, responseMessages.getter(req, 'login', 'invalid_credentials'));
        }

        const token = authService.issue_token({
            user_id: foundUser.id,
            email: email,
            role: String(foundUser.Role.name).trim().toLowerCase()
        });
        const refreshToken = authService.issue_refresh_token({
            user_id: foundUser.id,
            email: email,
            role: String(foundUser.Role.name).trim().toLowerCase()
        });
        const login_time = new Date(Date.now());

        await foundUser.update({
            login_time,
            login_status: true
        });
        /**making json user record for mobile app */
        let userDetail = {
            full_name: foundUser.full_name,
            contact_no: foundUser.contact_no,
            age: foundUser.age,
            gender: foundUser.gender,
            login_time: foundUser.login_time,
            createdAt: foundUser.createdAt,
            postal_code: foundUser.UserDetails[0].postal_code,
            image: foundUser.UserDetails[0].image,
            address: foundUser.UserDetails[0].address,
            country: foundUser.UserDetails[0].CountryList ? foundUser.UserDetails[0].CountryList.country_name : '',
            country_id: foundUser.UserDetails[0].CountryList ? foundUser.UserDetails[0].CountryList.id : 0,
            /**0 means country_id not exist */
            state: foundUser.UserDetails[0].StateList ? foundUser.UserDetails[0].StateList.state_name : '',
            city: foundUser.UserDetails[0].CityList ? foundUser.UserDetails[0].CityList.city_name : '',
            brand: foundUser.Outlets[0] ? foundUser.Outlets[0].Brand.brand_name : '',
            brandLogo: foundUser.Outlets[0] ? foundUser.Outlets[0].Brand.image : '',
            outletName: foundUser.Outlets[0] ? foundUser.Outlets[0].outlet_name : ''
        }
        return response.success(res, responseMessages.getter(req, 'login', 'success'), {
            token,
            refreshToken,
            user: userDetail
        });

    };
    /**Logout user on the basis of token(after verify by auth gaurd)  */
    const logout = async (req, res) => {
        try {
            const {
                user
            } = req;
            // console.log("Tesitng is here: ", user)
            let getUser = await User.findOne({
                where: {
                    email: user.data.email
                }
            });
            if (getUser) {
                let updateUser = await User.update({
                    login_status: false
                }, {
                    where: {
                        id: getUser.id
                    }
                })
                if (updateUser[0] === 1) {
                    return response.successMsg(res, responseMessages.getter(req, 'login', 'logout'))
                } else {
                    return response.error(res, responseMessages.getter(req, 'login', 'logoutError'))
                }
            } else {
                return response.unauthorized(res, responseMessages.getter(req, 'login', 'unauthorized'));
            }
        } catch (error) {
            return response.error(res, error.message)
        }
    };
    /**sending verification code on email for forgot Password */
    const sendCode = async (req, res) => {
        try {
            const validationResponse = validate.email(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            let user = await User.findOne({
                where: {
                    email: req.body.email
                }
            });
            if (!user) {
                return response.error(res, responseMessages.getter(req, 'user', 'notRegistered'));
            }
            let code = Math.random().toString(36).substring(7);
            const newUserVerification = await UserVerification.create({
                verification_code: code,
                verification_type: 'forgot password',
                user_id: user.id,
                status: 'active'
            });
            if (newUserVerification) {
                await mailer.sendForgotEmail(user.email, code);
                return response.successMsg(res, responseMessages.getter(req, 'user', 'forgotEmail'))
            }

        } catch (error) {
            console.log("Error is ", error)
            return response.error(res, error.message)
        }
    }
    /**verify code and email then set new password of forgot request */
    const verifyAndResetPassword = async (req, res) => {
        try {
            const validationResponse = validate.verifyAndResetPassword(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            const getUser = await User.findOne({
                where: {
                    email: req.body.email
                }
            });
            if (!getUser) {
                return response.recordNotFound(res, req);
            }
            const userVerification = await UserVerification.findOne({
                where: {
                    verification_code: req.body.code,
                    verification_type: 'forgot password'
                }
            });
            if (!userVerification) {
                return response.error(res, responseMessages.getter(req, 'verify_email', 'wrongCode'));
            }
            if (userVerification.status !== 'active') {
                return response.error(res, responseMessages.getter(req, 'verify_email', 'codeExpire'));
            }
            /**checking, is verification code expire or not. */
            const diff = moment(new Date(Date.now())).diff(moment(new Date(userVerification.updatedAt)));
            const elapsedTime = moment.duration(diff).asSeconds();
            const expiryTime = keys.verificationLink.expiry;
            if (elapsedTime <= expiryTime) {
                await userVerification.update({
                    status: 'used'
                });
                await getUser.update({
                    password: req.body.password
                });
                return response.successMsg(res, responseMessages.getter(req, 'reset_password', 'success'));
            } else {
                await userVerification.update({
                    status: 'expired'
                });
                return response.error(res, responseMessages.getter(req, 'verify_email', 'codeExpire'));
            }

        } catch (error) {
            console.log('Error:', error)
            return response.error(res, error.message)
        }
    }
    const verifyEmail = async (req, res) => {
        try {
            const {
                code
            } = req.params;
            const body = req.params;
            let bodyTemplate;
            const validationResponse = validate.verify_email_body(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }

            const foundUserVerification = await UserVerification.findOne({
                where: {
                    verification_code: code,
                    verification_type: 'email'
                }
            });

            if (!foundUserVerification) {
                return response.error(res, responseMessages.getter(req, 'verify_email', 'link_expired'));
            }

            if (foundUserVerification.status == 'used' || foundUserVerification.status == 'expired') {
                let errorKey = (foundUserVerification.status == 'used') ? 'alreadyVerified' : 'link_expired';
                const templatePath = path.join(__dirname, '../views/error.pug');
                const message = responseMessages.getter(req, 'verify_email', errorKey);
                bodyTemplate = pug.renderFile(templatePath, {
                    message,
                    error: {
                        status: 409
                    }
                });
                return response.htmlTemplate(res, bodyTemplate);
            }

            const foundUser = await User.findOne({
                where: {
                    id: foundUserVerification.user_id
                }
            });

            if (!foundUser) {
                return response.recordNotFound(res, req);
            }

            const verificationCodeTime = new Date(foundUserVerification.updatedAt);
            const currentTime = new Date(Date.now());
            const diff = moment(currentTime).diff(moment(verificationCodeTime));
            const elapsedTime = moment.duration(diff).asSeconds();

            const expiryTime = keys.verificationLink.expiry;

            if (elapsedTime <= expiryTime) {
                await foundUserVerification.update({
                    status: 'used'
                });
                await foundUser.update({
                    is_email_verified: true,
                    user_status: 'active',
                    user_status_changed_at: currentTime
                });
                const templatePath = path.join(__dirname, '../views/confirmUserVerification.pug');
                const message = responseMessages.getter(req, 'verify_email', 'success');
                const userName = foundUser.full_name;
                bodyTemplate = pug.renderFile(templatePath, {
                    userName,
                    message
                });
                return response.htmlTemplate(res, bodyTemplate);
            } else {
                await foundUserVerification.update({
                    status: 'expired'
                });
                const templatePath = path.join(__dirname, '../views/error.pug');
                const message = responseMessages.getter(req, 'verify_email', 'link_expired');
                bodyTemplate = pug.renderFile(templatePath, {
                    message,
                    error: {
                        status: 409
                    }
                });
                return response.htmlTemplate(res, bodyTemplate);
            }

        } catch (error) {
            console.log("Error::", error)
            return response.error(res, error.message);
        }

    };
    const resetPassword = async (req, res) => {
        const body = req.body;
        const {
            user,
            old_password,
            password
        } = req.body;

        const validationResponse = validate.login_body(body);
        if (!validationResponse.status) {
            return response.bodyNotFound(res, validationResponse.msg);
        }

        const foundUser = await User.findOne({
            where: {
                id: user.user_id
            }
        });

        if (!foundUser) {
            return response.recordNotFound(res, req);
        }

        if (!foundUser.is_email_verified) {
            return response.unauthorized(res, responseMessages.getter(req, 'login', 'email_not_verified'));
        }

        if (!foundUser.user_status) {
            return response.unauthorized(res, responseMessages.getter(req, 'login', 'user_blocked'));
        }

        if (!bcryptService.comparePassword(old_password, foundUser.password)) {
            return response.unauthorized(res, responseMessages.getter(req, 'login', 'invalid_credentials'));
        }

        await foundUser.update({
            password
        });

        return response.success(res, responseMessages.getter(req, 'reset_password', 'success'), {});

    };
    /**Updating user Profile data */
    const updateProfile = async (req, res) => {
        // console.log(req);
        try {
            const {
                user
            } = req;
            const body = req.body;

            const validationResponse = validate.update_profile_body(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }

            const foundUser = await User.findOne({
                where: {
                    id: user.data.user_id
                }
            });

            if (!foundUser) {
                return response.unauthorized(res, responseMessages.getter(req, 'update_profile', 'user_not_found'));
            }

            await foundUser.update({
                full_name: body.full_name,
                age: body.age,
                gender: body.gender
            });
            const foundUserDetail = await UserDetail.findOne({
                where: {
                    user_id: user.data.user_id
                }
            });
            if (foundUserDetail) {
                await foundUserDetail.update({
                    postal_code: body.postal_code,
                    address: body.address,
                    country_id: body.country_id,
                    state_id: body.state_id ? body.state_id : null,
                    city_id: body.city_id ? body.city_id : null
                });
            }

            const updateUser = await User.findOne({
                where: {
                    id: user.data.user_id
                },
                include: {
                    model: UserDetail,
                    attributes: ['postal_code', 'address', 'image'],
                    include: [{
                            model: CountryList,
                            attributes: ['id', 'country_name']
                        },
                        {
                            model: StateList,
                            attributes: ['state_name']
                        },
                        {
                            model: CityList,
                            attributes: ['city_name']
                        }
                    ]
                }
            });
            /**assigning state name and city name */
            let state = '';
            let city = '';
            if (updateUser.UserDetails[0].StateList) {
                state = updateUser.UserDetails[0].StateList.state_name
            }
            if (updateUser.UserDetails[0].CityList) {
                state = updateUser.UserDetails[0].CityList.city_name
            }
            /**making json user record for mobile app */
            let userDetail = {
                full_name: updateUser.full_name,
                contact_no: updateUser.contact_no,
                age: updateUser.age,
                gender: updateUser.gender,
                login_time: updateUser.login_time,
                createdAt: updateUser.createdAt,
                postal_code: updateUser.UserDetails[0].postal_code,
                image: updateUser.UserDetails[0].image,
                address: updateUser.UserDetails[0].address,
                country: updateUser.UserDetails[0].CountryList.country_name,
                country_id: updateUser.UserDetails[0].CountryList.id,
                state: state,
                city: city,
            }

            return response.success(res, responseMessages.getter(req, 'update_profile', 'success'), {
                user: userDetail
            });

        } catch (error) {
            console.log("Error:::", error);
            return response.error(res, error.message)
        }
    };
    /**Updating user profile image */
    const updateImageOld = async (req, res) => {
        try {
            const {
                user
            } = req;
            let image = req.body.image;
            /** uploading profile image */
            let base64Image = buf = new Buffer(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
            const type = image.split(';')[0].split('/')[1];
            /**Creating new object and intializing Params */
            let s3 = new AWS.S3({
                params: {
                    Bucket: commonConstants.S3_BUCKET_NAME + '/api/user-images'
                }
            });
            let params = {
                Key: `${Date.now()}`,
                Body: base64Image,
                ACL: 'public-read',
                ContentEncoding: 'base64',
                ContentType: 'image/' + type,
            };
            /**This Function for uploading Image on S3 Bucket */
            s3.upload(params, req, async function (err, data) {
                if (err) {
                    return response.error(res, error.message)
                } else {
                    let updateUser = await UserDetail.update({
                        image: data.Location,
                    }, {
                        where: {
                            user_id: user.data.user_id
                        }
                    });
                    if (updateUser[0] === 1) {
                        return response.successOther(res, responseMessages.getter(req, 'update_profile', 'profileImage'), data.Location);
                    } else {
                        return response.error(res, responseMessages.getter(req, 'update_profile', 'error'))
                    }
                }
            });

        } catch (error) {
            console.log("Error ::::", error)
            return response.error(res, error.message)
        }
    }
    /**Refresh User Token */
    const refreshToken = async (req, res) => {
        try {
            let token = req.headers.authorization;
            if (String(token).startsWith('Bearer ')) {
                token = token.slice(7, token.length);
            }
            if (token) {
                const decode = await authService.verify_refresh_token(token);
                if (decode) {
                    const foundUser = await User.findOne({
                        where: {
                            email: decode.email
                        }
                    });
                    if (foundUser) {
                        const token = authService.issue_token({
                            user_id: foundUser.id,
                            email: foundUser.email
                        });
                        return response.success(res, responseMessages.getter(req, 'login', 'refreshedToken'), {
                            token
                        });
                    } else {
                        return response.unauthorized(res, responseMessages.getter(req, 'login', 'unauthorized'));
                    }
                } else {
                    return response.unauthorized(res, responseMessages.getter(req, 'login', 'tokenExpire'));
                }

            } else {
                return response.unauthorized(res, responseMessages.getter(req, 'login', 'invalidToken'));
            }

        } catch (error) {
            return response.unauthorized(res, error.message);
        }
    }

    /**Updating user profile image */
    const updateImage = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {});

            if (JoiResponse.error) {
                deleteProfilePicS3Buket(req);
                return response.error(res, JoiResponse.error.details[0].message);
            };

            var filePathFullUrl = req.file.location;

            const foundUserDetail = await UserDetail.findOne({
                where: {
                    user_id: user.data.user_id
                }
            });
            if (foundUserDetail) {
                foundUserDetail.image = filePathFullUrl;
                foundUserDetail.save();
                return response.successOther(res, responseMessages.getter(req, 'update_profile', 'profileImage'), filePathFullUrl);
            } else {
                deleteProfilePicS3Buket(req);
                return response.error(res, "User detail not found")
            }

        } catch (error) {
            console.log("Error ::::", error);
            deleteProfilePicS3Buket(req);
            return response.error(res, error.message)
        }
    }

    return {
        register,
        login,
        logout,
        sendCode,
        verifyAndResetPassword,
        verifyEmail,
        resetPassword,
        updateProfile,
        updateImage,
        refreshToken,
        outletUserLogin
    };

};



module.exports = AuthController;

async function createCryptoWallets(userObj, txnObj) {
    var cryptoWalletArray = [];
    const allCoins = await Coins.findAll({
        attributes: ['coinId'],
        where: {
            softDelete: false,
        }
    });
    allCoins.forEach(coin => {
        cryptoWalletArray.push({
            userId: userObj.id,
            coinId: coin.coinId
        })
    });

    if (txnObj)
        await UserWalletCrypto.bulkCreate(cryptoWalletArray, {
            transaction: txnObj
        });
    else
        await UserWalletCrypto.bulkCreate(cryptoWalletArray);
}

async function createRewardWalletCrypto(userObj, txnObj) {

    var coinObj = await Coins.findOne({
        attributes: ["coinId"],
        where: {
            coinName: "Intercash"
        }
    });
    if (!coinObj)
        return null;

    if (txnObj)
        await RewardWalletCrypto.create({
            userId: userObj.id,
            coinId: coinObj.coinId
        }, {
            transaction: txnObj
        })
};

async function deleteProfilePicS3Buket(req) {
    if (!req.file)
        return
    if (req.file.key) {
        s3.deleteObject({
            Bucket: commonConstants.S3_BUCKET_NAME,
            Key: req.file.key
        }, function (err, data) {
            console.log("profile pic deleted from s3 bucket. TAK")
        })
    }
}