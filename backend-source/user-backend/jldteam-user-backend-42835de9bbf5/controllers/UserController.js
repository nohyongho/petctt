// models
const User = require('../models/User');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const validate = require('../helper/validators/AuthController/validate');
/** Helpers */
const response = require('../helper/response');
const responseMessages = require('../helper/responseMessages');
// const responseMessages = require('../helper/koreanMessages');
const bcryptService = require('../services/bcrypt.service');

const UserController = () => {
    /**change password from user setting in app */
    const changePassword = async (req, res) => {
        try {
            const {
                user
            } = req;
            // const confirmPassword = req.body.confirmPassword
            const validationResponse = validate.changePassword(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            let {
                oldPassword,
                newPassword
            } = req.body;
            let getUser = await User.findOne({
                where: {
                    email: user.data.email
                }
            });
            if (getUser) {
                if (!bcryptService.comparePassword(oldPassword, getUser.password)) {
                    return response.unauthorized(res, responseMessages.getter(req, 'user', 'wrongOldPassword'));
                }

                let updateUser = await User.update({
                    password: newPassword
                }, {
                    where: {
                        email: user.data.email
                    }
                });
                if (updateUser[0] === 1) {
                    response.successMsg(res, responseMessages.getter(req, 'user', 'changePassSuccess'));
                } else {
                    return response.error(res, responseMessages.getter(req, 'user', 'error'));
                }

            } else {
                return response.error(res, responseMessages.getter(req, 'user', 'error'));
            }

        } catch (error) {
            return response.error(res, error.message);
        }
    }
    /**Gettting Contact list by matching mobile contacts with DB users accounts */
    const getContacts = async (req, res) => {
        try {
            const validationResponse = validate.contactsArray(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            let newArray = [];
            let responseArray = [];
            let contactsArray = req.body.contacts;

            contactsArray.forEach(element => {
                newArray.push(element.contactNo);
            });

            let arrayList = await User.findAll({
                attributes: ["contact_no"],

                where: {
                    contact_no: {
                        [Op.in]: newArray
                    }
                },
            });

            arrayList = arrayList.map(ele => ele.contact_no);
            // contactsArray.forEach(arrayElement => {
            //     arrayList.forEach(element => {
            //         if (arrayElement.contactNo === element.contact_no) {
            //             responseArray.push({
            //                 name: arrayElement.name,
            //                 contactNo: arrayElement.contactNo,
            //                 isAvailable: true
            //             });
            //         }
            //     });
            //     const found = responseArray.find(element => element.contactNo === arrayElement.contactNo);
            //     if (found === undefined) {
            //         responseArray.push({
            //             name: arrayElement.name,
            //             contactNo: arrayElement.contactNo,
            //             isAvailable: false
            //         });
            //     }
            // });
            //response.success(res, responseMessages.getter(req, 'common', 'success'), responseArray);
            response.success(res, responseMessages.getter(req, 'common', 'success'), arrayList);

        } catch (error) {
            console.log("Error::", error);
            response.error(res, error.message);
        }
    }
    return {
        changePassword,
        getContacts
    }

};

module.exports = UserController;