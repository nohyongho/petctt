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

/** Keys */
const keys = require('../config/keys');

/**Services  */
const uploadImage = require('../services/imageUpload.service');

/** Helpers */
const response = require('../helper/response');
const responseMessages = require('../helper/responseMessages');
const constant = require('../constants/ConstantMessages');
const validate = require('../helper/validators/AuthValidator');
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
global.merchantprefix = "merchant_";



const AuthController = () => {
    /**Registration for Merchant on Web Portal */
    const register = async(req, res) => {
        try {
            const body = req.body;

            /**validation is done by JOI validator library */
            const validationResponse = validate.registrationBody(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            const { email, country_id } = req.body;
            /**find Record from user table either user already exist or not. */
            //const foundUser = await User.findOne({ where: { [Op.or]: [{ email: email }, { contact_no: req.body.contact_no }] } });
            const foundUser = await User.findOne({
                where: {
                    [Op.or]: [{ merchant_email: email }]
                }
            });
            if (foundUser) {
                return response.error(res, constant.ALREADY_REGISTERED);
            }
            /*get the role id*/
            const foundRole = await Role.findOne({ where: { name: 'merchant' } });

            if (!foundRole) {
                return response.error(res, constant.SERVER_ERROR);
            }

            const currentTime = new Date(Date.now());
            /**Generating hash for Account Verification that will be sended to newly created account */
            const secret = keys.verificationLink.key;
            const hash = crypto.createHmac('sha256', secret)
                .update(String(email))
                .digest('hex');



            /**
             * Here we are using Managed Transation. 
             * Managed transactions handle comitting or rolling back the transaction automagically.
             * You start a managed transaction by passing a callback to sequelize.transaction.
             * Notice how the callback passed to transaction returns a promise chain,
             * If all promises in the returned chain are resolved successfully the transaction is comitted.
             * If one or several of the promises are rejected, the transaction is rolled back.
             */

            var newUserJson = {
                full_name: body.full_name,
                merchant_email: body.email,
                merchant_password: body.password,
                user_status: 'notverified',
                role_id: foundRole.id,
                login_status: true,
                is_email_verified: false,
                user_status_changed_at: currentTime
            };



            return sequelize.transaction(function(t) {
                return User.create(
                    newUserJson, { transaction: t }).then(function(user) {
                    return UserDetail.create({
                        user_id: user.id
                    }, { transaction: t }).then(function(userDetail) {

                        return UserVerification.create({
                            verification_code: hash,
                            verification_type: 'email',
                            user_id: user.id,
                            status: 'active'
                        }, { transaction: t });
                    });
                });
            }).then(async function(result) {

                /**creating merchant crypto wallet */
                let merchant_crypto_wallet = await UserWalletCrypto.create({
                    user_id: result.user_id,
                    coin_id: 1,
                    soft_delete: false,

                });

                /**creating merchant fiat wallet */
                let merchant_fiat_wallet = await UserWalletFiat.create({
                    user_id: result.user_id,
                    symbol: '원',
                    sign: '₩',
                    soft_delete: false,
                });

                await mailer.sendVerificationEmail(email, hash, req.body.full_name);
                return response.success(res, constant.NEW_USER_CREATED, { user_id: result.user_id });
            }).catch(function(err) {
                // if (err && err.errors && err.errors[0].path === 'brand_name_UNIQUE') {
                //     return response.error(res, constant.BRAND_UNIQUE);
                // } else {


                return response.error(res, err.message);

                // }
            });
        } catch (error) {

            return response.error(res, error.message);
        }


    };

    /** Brand Creation */

    const brandcreation = async(req, res) => {
        try {
            const body = JSON.parse(req.body.createBrand);
            // const body = req.body;





            /**validation is done by JOI validator library */
            const validationResponse = validate.brandCreation(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }

            var brandObj = await Brand.create({
                brand_name: body.brand_name,
                phone_number: body.phone_number,
                country_code: body.country_code,
                postal_code: body.postal_code,
                address: body.address,
                category_id: body.brand_category,
                user_id: body.user_id,
                country_id: body.country_id,
                //image:'/bImage/'+req.file.filename
                image: req.filepath
            }).then(async function(result) {



                // return response.success(res, constant.NEW_USER_CREATED);
                //,{id : brandObj.id,}
                return response.success(res, constant.BRAND_CREATED, { id: result.id });
            }).catch(function(err) {
                if (err && err.errors && err.errors[0].path === 'brand_name_UNIQUE') {
                    return response.error(res, constant.BRAND_UNIQUE);
                } else {
                    return response.error(res, err.message);

                }
            });



        } catch (error) {

            return response.error(res, error.message);
        }
    };








    /** Brand update */

    const brandupdate = async(req, res) => {
        try {

            const { user } = req;
            const body = JSON.parse(req.body.updateBrand);

            // const body = req.body;

            /**validation is done by JOI validator library */
            const validationResponse = validate.brandupdate(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }

            let getbrand = await Brand.findOne({ where: { id: body.brand_id, user_id: user.data.user_id } });

            if (getbrand) {
                var brandObj = await Brand.update({
                        brand_name: body.brand_name,
                        phone_number: body.phone_number,
                        country_code: body.country_code,
                        postal_code: body.postal_code,
                        address: body.address,

                    },

                    {
                        where: { id: body.brand_id }
                    });


                //image:'/bImage/'+req.file.filename
                if (req.fileexist) {

                    await Brand.update({
                            image: req.filepath,
                        },

                        {
                            where: { id: body.brand_id }
                        });
                }

                return response.success(res, constant.BRAND_UPDATED);

            } else {
                return response.error(res, constant.BRAND_NOTFOUND);
            }


        } catch (error) {

            return response.error(res, error.message);
        }
    };






    const verifyEmail = async(req, res) => {
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

            if (foundUserVerification.status !== 'active') {
                const templatePath = path.join(__dirname, '../views/error.pug');
                const message = responseMessages.getter(req, 'verify_email', 'alreadyVerified');
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

            return response.error(res, error.message);
        }

    };


    /**Web Portal login for mecrhant and super admin also mobile app for merchant login is being handled here */
    const login = async(req, res) => {

        const { email, password } = req.body;
        const body = req.body;




        /**validation is done by JOI validator library */
        const validationResponse = validate.loginBody(body);

        if (!validationResponse.status) {
            return response.bodyNotFound(res, validationResponse.msg);
        }
        /**find User Exist or not */
        const foundUser = await User.findOne({
            where: { merchant_email: email, isDeleted: false },
            include: [{
                    model: UserDetail,
                    attributes: ['postal_code', 'address', 'image'],
                    required: false
                        //     include: [
                        //         {
                        //             model: CountryList,
                        //             attributes: ['id', 'country_name'],
                        //             required : false
                        //         },
                        //         // {
                        //         //     model: StateList,
                        //         //     attributes: ['state_name'],
                        //         //    // required : false

                    //         // },
                    //         {
                    //             model: CityList,
                    //             attributes: ['city_name'],
                    //           //  required : false

                    //         }
                    //     ]
                },
                {
                    model: Role,
                    where: {
                        [Op.or]: [{ name: 'admin' }, { name: 'merchant' }]
                    }
                }
            ]
        });




        if (!foundUser) {
            return response.error(res, constant.INVALID_USER);
        }
        /** This is check for email is verified or not */
        if (foundUser.is_email_verified == false) {
            return response.error(res, constant.EMAIL_NOT_VERIFIED);
        }


        /**is User status is Active or blocked*/
        if (foundUser.user_status == 'blocked') {
            return response.error(res, constant.USER_BLOCKED);
        }



        /**password comparision by bcrypt service */
        if (!bcryptService.comparePassword(password, foundUser.merchant_password)) {
            return response.unauthorized(res, constant.INVALID_CREDENTIALS);
        }

        /**creating Json Web Token with Refresh Token  */
        const token = authService.issue_token({ user_id: foundUser.id, email: foundUser.merchant_email, role: String(foundUser.Role.name).trim().toLowerCase() });
        const refreshToken = authService.issue_refresh_token({ user_id: foundUser.id, email: foundUser.merchant_email, role: String(foundUser.Role.name).trim().toLowerCase() });
        const login_time = new Date(Date.now());

        /**update user login time with current time and login status true */
        await foundUser.update({
            login_time,
            login_status: true
        });





        if (foundUser) {


            const foundcryptowallet = await UserWalletCrypto.findOne({
                where: { user_id: foundUser.id },

            });

            const foundfiatwallet = await UserWalletFiat.findOne({
                where: { user_id: foundUser.id },

            });

            if (!foundcryptowallet) {


                /**creating merchant crypto wallet */
                let merchant_crypto_wallet = await UserWalletCrypto.create({
                    user_id: foundUser.id,
                    coin_id: 1,
                    soft_delete: false,

                });

            }
            if (!foundfiatwallet) {

                /**creating merchant fiat wallet */
                let merchant_fiat_wallet = await UserWalletFiat.create({
                    user_id: foundUser.id,
                    symbol: '원',
                    sign: '₩',
                    soft_delete: false,
                });


            }


        }




        /**assigning state name and city name */
        let state = '';
        let city = '';
        //   if (foundUser.UserDetails.length > 0 && foundUser.UserDetails[0].StateList) { state = foundUser.UserDetails[0].StateList.state_name; }
        //  if (foundUser.UserDetails.length > 0 && foundUser.UserDetails[0].CityList) { state = foundUser.UserDetails[0].CityList.city_name; }

        /**making json user record for mobile app */
        let userDetail = {
            id: foundUser.id,
            fullName: foundUser.full_name,
            email: foundUser.merchant_email,
            //  country_id: foundUser.UserDetails[0].country_id,
            //city_id: foundUser.UserDetails[0].city_id,
            contactNo: foundUser.contact_no,
            age: foundUser.age,
            gender: foundUser.gender,
            isEmailVerified: foundUser.is_email_verified,
            loginTime: foundUser.login_time,
            createdAt: foundUser.createdAt,
            userStatus: foundUser.user_status,
            image: foundUser.UserDetails.length > 0 ? foundUser.UserDetails[0].image : '',

            roleId: foundUser.role_id,
            role: String(foundUser.Role.name).trim().toLowerCase(),
            token: token,
            refreshToken: refreshToken
        };

        return response.success(res, constant.LOGIN_SUCCESS, userDetail);

    };


    /**Web Portal logout on the basis of JWT token */
    const logout = async(req, res) => {
        try {
            const { user } = req;

            let getUser = await User.findOne({ where: { merchant_email: user.data.email } });
            if (getUser) {
                let updateUser = await User.update({ login_status: false }, { where: { id: getUser.id } });
                if (updateUser[0] === 1) {
                    return response.successMsg(res, constant.LOGOUT_SUCCESS);
                } else {
                    return response.error(res, constant.SERVER_ERROR);
                }
            } else {
                return response.error(res, constant.SERVER_ERROR);
            }
        } catch (error) {
            return response.error(res, error.message);
        }
    };

    /**sending verification code on email for chnage Password */
    const sendCodechangepassword = async(req, res) => {
        try {
            const { user } = req;
            let getuser = await User.findOne({ where: { merchant_email: user.data.email } });
            if (!getuser) {
                return response.error(res, constant.INVALID_USER);
            }
            // /** This is check for email is verified or not */
            // if (getuser.is_email_verified) {
            //     return response.error(res, constant.EMAIL_NOT_VERIFIED);
            // }


            // /**is User status is Active or blocked*/
            // if (getuser.user_status == 'blocked') {
            //     return response.error(res, constant.USER_BLOCKED);
            // }
            let code = Math.random().toString(36).substring(7);
            const newUserVerification = await UserVerification.create({ verification_code: code, verification_type: 'change password', user_id: getuser.id, status: 'active' });
            if (newUserVerification) {
                await mailer.sendResetEmail(getuser.merchant_email, code);
                return response.successMsg(res, constant.CODE_SENT);
            }

        } catch (error) {

            return response.error(res, error.message)
        }
    }



    /**verify code and email then set new password of change password request */
    const verifyAndResetchangePassword = async(req, res) => {
        try {

            const { user } = req;

            const validationResponse = validate.verifyAndResetchangePassword(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            const getUser = await User.findOne({ where: { merchant_email: user.data.email } });
            if (!getUser) {
                return response.recordNotFound(res, req);
            }
            const userVerification = await UserVerification.findOne({ where: { verification_code: req.body.code, verification_type: 'change password' } });
            if (!userVerification) {
                return response.error(res, constant.WRONG_CODE);
            }
            if (userVerification.status !== 'active') {
                return response.error(res, constant.EXPIRED_CODE);
            }

            if (req.body.password !== req.body.confirmPassword) {
                return response.error(res, constant.PASSWORDS_NOMATCH);
            }

            /**checking, is verification code expire or not. */
            const diff = moment(new Date(Date.now())).diff(moment(new Date(userVerification.updatedAt)));
            const elapsedTime = moment.duration(diff).asSeconds();
            const expiryTime = keys.verificationLink.expiry;
            if (elapsedTime <= expiryTime) {
                await userVerification.update({ status: 'used' });
                await getUser.update({ merchant_password: req.body.password });
                return response.successMsg(res, constant.RESET_PASSWORD_SUCCESS);
            } else {
                await userVerification.update({ status: 'expired' });
                return response.error(res, constant.EXPIRED_CODE);
            }

        } catch (error) {

            return response.error(res, error.message)
        }
    }



    /**sending verification code on email for forgot Password */
    const sendCodeforgotpassword = async(req, res) => {
        try {
            const validationResponse = validate.email(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }

            const getUser = await User.findOne({ where: { merchant_email: req.body.email } });

            //console.log(getUser);
            if (!getUser) {


                return response.error(res, constant.INVALID_USER);
            }

            // console.log(user.is_email_verified)
            /** This is check for email is verified or not */
            // if (user.is_email_verified == false) {
            //     return response.error(res, constant.EMAIL_NOT_VERIFIED);
            // }


            // /**is User status is Active or blocked*/
            // if (user.user_status == 'blocked') {
            //     return response.error(res, constant.USER_BLOCKED);
            // }
            let code = Math.random().toString(36).substring(7);
            const newUserVerification = await UserVerification.create({ verification_code: code, verification_type: 'forgot password', user_id: getUser.id, status: 'active' });
            if (newUserVerification) {
                await mailer.sendForgotEmail(getUser.merchant_email, code);
                return response.successMsg(res, constant.CODE_SENT);
            }







        } catch (error) {

            return response.error(res, error.message)
        }
    }



    /**verify code and email then set new password of forgot request */
    const verifyAndResetforgotPassword = async(req, res) => {
        try {
            const validationResponse = validate.verifyAndResetPassword(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            const getUser = await User.findOne({ where: { merchant_email: req.body.email } });
            if (!getUser) {
                return response.recordNotFound(res, req);
            }
            const userVerification = await UserVerification.findOne({ where: { verification_code: req.body.code, verification_type: 'forgot password' } });
            if (!userVerification) {
                return response.error(res, constant.WRONG_CODE);
            }
            if (userVerification.status !== 'active') {
                return response.error(res, constant.EXPIRED_CODE);
            }

            if (req.body.password !== req.body.confirmPassword) {
                return response.error(res, constant.PASSWORDS_NOMATCH);
            }

            /**checking, is verification code expire or not. */
            const diff = moment(new Date(Date.now())).diff(moment(new Date(userVerification.updatedAt)));
            const elapsedTime = moment.duration(diff).asSeconds();
            const expiryTime = keys.verificationLink.expiry;
            if (elapsedTime <= expiryTime) {
                await userVerification.update({ status: 'used' });
                await getUser.update({ merchant_password: req.body.password });
                return response.successMsg(res, constant.RESET_PASSWORD_SUCCESS);
            } else {
                await userVerification.update({ status: 'expired' });
                return response.error(res, constant.EXPIRED_CODE);
            }

        } catch (error) {

            return response.error(res, error.message)
        }
    }






    /**geting individual user detail with their coupons active redem and expired on the basis of userId */
    const loadprofile = async(req, res) => {
        try {
            //let { userId } = req.body;
            const { user } = req;

            /**Find User Detail */
            let finduser = await User.findOne({
                where: { id: user.data.user_id },
                include: [{ model: Role, attributes: ['name'] },
                    {
                        model: UserDetail,
                        attributes: ['postal_code', 'address', 'image', 'country_id'],
                        include: [{ model: CountryList, attributes: ['country_name'] }, { model: StateList, attributes: ['state_name'] }, { model: CityList, attributes: ['city_name'] }]
                    }
                ]
            });

            /**assigning state name and city name */
            let state = '';
            let city = '';
            if (finduser.UserDetails[0].StateList) { state = finduser.UserDetails[0].StateList.state_name; }
            if (finduser.UserDetails[0].CityList) { state = finduser.UserDetails[0].CityList.city_name; }


            let userDetail = {
                id: finduser.id,
                fullName: finduser.full_name,
                email: finduser.email,
                //    contactNo: finduser.contact_no,
                //  age: finduser.age,
                // gender: finduser.gender,
                loginTime: finduser.login_time,
                createdAt: finduser.createdAt,
                //  postalCode: finduser.UserDetails[0].postal_code,
                //  image: finduser.UserDetails[0].image,
                address: finduser.UserDetails[0].address,
                country: finduser.UserDetails[0].country_id ? finduser.UserDetails[0].CountryList.country_name : null,
                state: state,
                city: city
            };



            if (finduser.length != 0) {

            } else {
                return response.error(res, constant.USERDETAIL_NOTFOUND);
            }


            return response.successDT(res, constant.SUCCESS, userDetail);





        } catch (error) {

            return response.error(res, error.msg);
        }



    }









    /** Account creation for outlet user */
    const createOutletUser = async(req, res) => {
        try {
            const body = req.body;
            /**
             * validation is done by Joi validator
             */
            const validationResponse = validate.createOutletUserBody(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }

            const { email, country_id } = req.body;
            /**
             * find the user is already exist or not
             */
            const foundUser = await User.findOne({
                where: {
                    [Op.or]: [{ email: email }, { contact_no: req.body.contact_no }]
                }
            });
            if (foundUser) {
                return response.error(res, constant.ALREADY_REGISTERED);
            }
            /**
             * finding the role id for outlet user
             */
            const foundRole = await Role.findOne({ where: { name: 'outletUser' } });

            if (!foundRole) {
                return response.error(res, constant.SERVER_ERROR);
            }

            const currentTime = new Date(Date.now());
            /**
             * Generating hash for Account Verification that will be sended to newly created account
             */
            const secret = keys.verificationLink.key;
            const hash = crypto.createHmac('sha256', secret)
                .update(String(email))
                .digest('hex');
            /**
             * Here we are using Managed Transation. 
             * Managed transactions handle comitting or rolling back the transaction automagically.
             * You start a managed transaction by passing a callback to sequelize.transaction.
             * Notice how the callback passed to transaction returns a promise chain,
             * If all promises in the returned chain are resolved successfully the transaction is comitted.
             * If one or several of the promises are rejected, the transaction is rolled back.
             */
            return sequelize.transaction(function(t) {
                return User.create(
                    Object.assign({}, body, {
                        user_status: 'notverified',
                        role_id: foundRole.id,
                        login_status: false,
                        is_email_verified: false,
                        user_status_changed_at: currentTime
                    }), { transaction: t }).then(function(user) {
                    return UserDetail.create({
                        country_id,
                        address: req.body.address,
                        user_id: user.id
                    }, { transaction: t }).then(function(userDetail) {
                        return UserVerification.create({
                            verification_code: hash,
                            verification_type: 'email',
                            user_id: user.id,
                            status: 'active'
                        }, { transaction: t }).then(async function(userVerification) {
                            return MpUserOutlet.create({ /**Mapping table of user and outlet, an outlet can have multiple users */
                                user_id: user.id,
                                outlet_id: req.body.outletId
                            }, { transaction: t });
                        });
                    });
                });
            }).then(async function(result) {
                await mailer.sendVerificationEmail(email, hash, req.body.full_name);
                return response.success(res, constant.OUTLET_USER_SUCCESS);
            }).catch(function(err) {
                return response.error(res, err.message);
            });
        } catch (error) {

            return response.error(res, error.message);
        }


    };

    return {
        register,
        login,
        logout,
        sendCodeforgotpassword,
        verifyAndResetforgotPassword,
        createOutletUser,
        brandcreation,
        brandupdate,
        verifyEmail,
        loadprofile,
        sendCodechangepassword,
        verifyAndResetchangePassword,

    };

};

module.exports = AuthController;